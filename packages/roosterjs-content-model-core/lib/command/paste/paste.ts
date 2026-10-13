import { cleanHtmlComments } from './cleanHtmlComments';
import { cloneModelForPaste, mergePasteContent } from './mergePasteContent';
import { convertInlineCss } from '../createModelFromHtml/convertInlineCss';
import { createPasteFragment } from './createPasteFragment';
import { generatePasteOptionFromPlugins } from './generatePasteOptionFromPlugins';
import { retrieveHtmlInfo } from './retrieveHtmlInfo';
import type {
    PasteTypeOrGetter,
    ClipboardData,
    IEditor,
    DOMCreator,
} from 'roosterjs-content-model-types';

/**
 * Paste into editor using a clipboardData object
 * @param editor The Editor object.
 * @param clipboardData Clipboard data retrieved from clipboard
 * @param pasteTypeOrGetter Type of content to paste or function that returns the Paste Type to use based on the document and the clipboard Data. @default normal
 */
export function paste(
    editor: IEditor,
    clipboardData: ClipboardData,
    pasteTypeOrGetter: PasteTypeOrGetter = 'normal'
) {
    editor.focus();
    let isFirstPaste = false;

    if (!clipboardData.modelBeforePaste) {
        isFirstPaste = true;

        editor.formatContentModel(model => {
            clipboardData.modelBeforePaste = cloneModelForPaste(model);

            return false;
        });
    }

    // 1. Prepare variables
    const domCreator = editor.getDOMCreator();
    if (!domCreator.isBypassed && clipboardData.rawHtml) {
        clipboardData.rawHtml = cleanHtmlComments(clipboardData.rawHtml);
    }
    const doc = createDOMFromHtml(clipboardData.rawHtml, domCreator);
    const pasteType =
        typeof pasteTypeOrGetter == 'function'
            ? pasteTypeOrGetter(doc, clipboardData)
            : pasteTypeOrGetter;

    // 2. Handle HTML from clipboard
    const htmlFromClipboard = retrieveHtmlInfo(doc, clipboardData);

    // 3. Create target fragment
    const sourceFragment = createPasteFragment(
        // editor.getDocument()

        // todo: xmail: 粘贴解析时剥离节点的事件属性（如 img 的 onerror），并让 fragment 按剪贴板 html 的惰性文档创建，避免解析阶段执行脚本（剪贴板 xss）、加载图片等资源
        doc || editor.getDocument(),

        clipboardData,
        pasteType,
        (clipboardData.rawHtml == clipboardData.html
            ? doc
            : createDOMFromHtml(clipboardData.html, domCreator)
        )?.body
    );

    // 4. Trigger BeforePaste event to allow plugins modify the fragment
    const eventResult = generatePasteOptionFromPlugins(
        editor,
        clipboardData,
        sourceFragment,
        htmlFromClipboard,
        pasteType
    );

    // 5. Convert global CSS to inline CSS
    convertInlineCss(eventResult.fragment, htmlFromClipboard.globalCssRules);

    // 6. Merge pasted content into main Content Model
    mergePasteContent(editor, eventResult, isFirstPaste);
}

function createDOMFromHtml(
    html: string | null | undefined,
    domCreator: DOMCreator
): Document | null {
    // return html ? domCreator.htmlToDOM(html) : null;

    // todo: xmail: 粘贴解析时剥离节点的事件属性（如 img 的 onerror），并让 fragment 按剪贴板 html 的惰性文档创建，避免解析阶段执行脚本（剪贴板 xss）、加载图片等资源
    const doc = html ? domCreator.htmlToDOM(html) : null;
    stripEventAttributes(doc);
    return doc;
}

// todo: xmail: 粘贴解析时剥离节点的事件属性（如 img 的 onerror），并让 fragment 按剪贴板 html 的惰性文档创建，避免解析阶段执行脚本（剪贴板 xss）、加载图片等资源
function stripEventAttributes(doc: Document | null): void {
    if (!doc) {
        return;
    }

    const elements = doc.querySelectorAll('*');
    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const attributes = element.attributes;
        // 倒序遍历：删除属性会实时改变attributes集合
        for (let j = attributes.length - 1; j >= 0; j--) {
            const name = attributes[j].name;
            if (name.toLowerCase().indexOf('on') == 0) {
                element.removeAttribute(name);
            }
        }
    }
}
