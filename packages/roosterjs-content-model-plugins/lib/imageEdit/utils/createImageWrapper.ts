import { createImageCropper } from '../Cropper/createImageCropper';
import { createImageResizer } from '../Resizer/createImageResizer';
import { createImageRotator } from '../Rotator/createImageRotator';
import { wrap } from 'roosterjs-content-model-dom';

import type {
    IEditor,
    ImageEditOperation,
    ImageMetadataFormat,
} from 'roosterjs-content-model-types';
import type { ImageEditOptions } from '../types/ImageEditOptions';
import type { ImageHtmlOptions } from '../types/ImageHtmlOptions';

const IMAGE_EDIT_SHADOW_ROOT = 'ImageEditShadowRoot';

/**
 * @internal
 */
export interface WrapperElements {
    wrapper: HTMLSpanElement;
    shadowSpan: HTMLElement;
    imageClone: HTMLImageElement;
    resizers: HTMLDivElement[];
    rotators: HTMLDivElement[];
    croppers: HTMLDivElement[];
}

/**
 * @internal
 */
export function createImageWrapper(
    editor: IEditor,
    image: HTMLImageElement,
    options: ImageEditOptions,
    editInfo: ImageMetadataFormat,
    htmlOptions: ImageHtmlOptions,
    operation: ImageEditOperation[]
): WrapperElements {
    const imageClone = cloneImage(image, editInfo);
    const doc = editor.getDocument();

    let rotators: HTMLDivElement[] = [];
    if (!options.disableRotate && operation.indexOf('rotate') > -1) {
        rotators = createImageRotator(doc, htmlOptions);
    }
    let resizers: HTMLDivElement[] = [];
    if (operation.indexOf('resize') > -1) {
        // todo: xmail: 调整操作手柄样式
        resizers = createImageResizer(doc, options);
    }

    let croppers: HTMLDivElement[] = [];
    if (operation.indexOf('crop') > -1) {
        croppers = createImageCropper(doc);
    }

    const wrapper = createWrapper(
        editor,
        imageClone,
        options,
        editInfo,
        resizers,
        rotators,
        croppers
    );
    const imageSpan = wrap(doc, image, 'span');
    // todo：xmail：增加一个属性，避免span被编辑器过滤掉导致操作手柄不可见，也方便外部右键菜单判断
    const shadowSpan = createShadowSpan(wrapper, imageSpan);
    shadowSpan.dataset.imgEditShadow = 'true';
    return { wrapper, shadowSpan, imageClone, resizers, rotators, croppers };
}

const createShadowSpan = (wrapper: HTMLElement, imageSpan: HTMLSpanElement) => {
    const shadowRoot = imageSpan.attachShadow({
        mode: 'open',
    });

    // todo: xmail: 有高低两个图片并排时，选中图片之后要保持对齐方式避免跳动，也要避免上下图片之间留缝隙
    const image = imageSpan.getElementsByTagName('img')[0];
    imageSpan.style.display = 'inline-flex';
    imageSpan.style.verticalAlign = window.getComputedStyle(image).verticalAlign;
    imageSpan.id = IMAGE_EDIT_SHADOW_ROOT;
    // imageSpan.style.verticalAlign = 'bottom';

    shadowRoot.appendChild(wrapper);
    return imageSpan;
};

const createWrapper = (
    editor: IEditor,
    image: HTMLImageElement,
    options: ImageEditOptions,
    editInfo: ImageMetadataFormat,
    resizers?: HTMLDivElement[],
    rotators?: HTMLDivElement[],
    cropper?: HTMLDivElement[]
) => {
    const doc = editor.getDocument();
    const wrapper = doc.createElement('span');
    const imageBox = doc.createElement('div');

    imageBox.setAttribute(
        `style`,
        `position:relative;width:100%;height:100%;overflow:hidden;transform:scale(1);`
    );
    imageBox.appendChild(image);
    wrapper.setAttribute(
        'style',
        `font-size: 24px; margin: 0px; transform: rotate(${editInfo.angleRad ?? 0}rad);`
    );
    wrapper.style.display = editor.getEnvironment().isSafari
        ? '-webkit-inline-flex'
        : 'inline-flex';

    const border = createBorder(editor, options.borderColor);
    wrapper.appendChild(imageBox);
    wrapper.appendChild(border);
    wrapper.style.userSelect = 'none';

    if (resizers && resizers?.length > 0) {
        resizers.forEach(resizer => {
            wrapper.appendChild(resizer);
        });
    }
    if (rotators && rotators.length > 0) {
        rotators.forEach(r => {
            wrapper.appendChild(r);
        });
    }
    if (cropper && cropper.length > 0) {
        cropper.forEach(c => {
            wrapper.appendChild(c);
        });
    }

    return wrapper;
};

const createBorder = (editor: IEditor, borderColor?: string) => {
    const doc = editor.getDocument();
    const resizeBorder = doc.createElement('div');
    // todo: xmail: 修改选中图片时的外框样式
    const boxShadow = [
        '0 0 0 1px #FFFFFF',        // 第一层边框
        `0 0 0 2px ${borderColor}`, // 第二层边框
        '0 0 0 3px #FFFFFF',        // 第三层边框
    ].join(',');
    resizeBorder.setAttribute(
        `style`,
        `position:absolute;left:-1px;right:-1px;top:-1px;bottom:-1px;box-shadow:${boxShadow};pointer-events:none;`
    );
    return resizeBorder;
};

const cloneImage = (image: HTMLImageElement, editInfo: ImageMetadataFormat) => {
    const imageClone = image.cloneNode(true) as HTMLImageElement;
    imageClone.style.removeProperty('transform');
    if (editInfo.src) {
        imageClone.src = editInfo.src;
        imageClone.removeAttribute('id');
        imageClone.style.removeProperty('max-width');
        imageClone.style.removeProperty('max-height');
        imageClone.style.width = editInfo.widthPx + 'px';
        imageClone.style.height = editInfo.heightPx + 'px';
    }
    return imageClone;
};
