import { createParagraphDecorator } from 'roosterjs-content-model-dom';
import { formatParagraphWithContentModel } from '../utils/formatParagraphWithContentModel';
import type { IEditor } from 'roosterjs-content-model-types';

/**
 * Toggles the current block(s) margin properties.
 * null deletes any existing value, undefined is ignored
 * @param editor The editor to operate on
 * @param marginTop value for top margin
 * @param marginBottom value for bottom margin
 */
export function setParagraphMargin(
    editor: IEditor,
    marginTop?: string | null,
    marginBottom?: string | null
) {
    editor.focus();

    formatParagraphWithContentModel(editor, 'setParagraphMargin', para => {
        if (!para.decorator) {
            // todo: xmail: 将段落标签从p改为div，避免复制内容粘贴到记事本时每个标签后面都多一个换行
            para.decorator = createParagraphDecorator('div');
            // para.decorator = createParagraphDecorator('p');
        }

        if (marginTop) {
            para.format.marginTop = marginTop;
        } else if (marginTop === null) {
            delete para.format.marginTop;
        }

        if (marginBottom) {
            para.format.marginBottom = marginBottom;
        } else if (marginBottom === null) {
            delete para.format.marginBottom;
        }
    });
}
