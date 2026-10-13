import { toggleModelBlockQuote } from '../../modelApi/block/toggleModelBlockQuote';
import type { ContentModelFormatContainerFormat, IEditor } from 'roosterjs-content-model-types';

// todo: xmail: 引用块只保留标签不写默认样式，样式由编辑器样式文件控制，方便各端展示时应用自己的默认样式
const DefaultQuoteFormatLtr: ContentModelFormatContainerFormat = {
    // borderLeft: '3px solid rgb(200, 200, 200)',
    // textColor: 'rgb(102, 102, 102)',
};
// todo: xmail: 引用块只保留标签不写默认样式，样式由编辑器样式文件控制，方便各端展示时应用自己的默认样式
const DefaultQuoteFormatRtl: ContentModelFormatContainerFormat = {
    // borderRight: '3px solid rgb(200, 200, 200)',
    // textColor: 'rgb(102, 102, 102)',
};
// todo: xmail: 引用块只保留标签不写默认样式，样式由编辑器样式文件控制，方便各端展示时应用自己的默认样式
// const BuildInQuoteFormat: ContentModelFormatContainerFormat = {
//     marginTop: '1em',
//     marginBottom: '1em',
//     marginLeft: '40px',
//     marginRight: '40px',
// };

/**
 * Toggle BLOCKQUOTE state of selected paragraphs.
 * If any selected paragraph is not under a BLOCKQUOTE, wrap them into a BLOCKQUOTE.
 * Otherwise, unwrap all related BLOCKQUOTEs.
 * @param editor The editor object to toggle BLOCKQUOTE onto
 * @param quoteFormat @optional Block format for the new quote object
 */
export function toggleBlockQuote(
    editor: IEditor,
    quoteFormat?: ContentModelFormatContainerFormat,
    quoteFormatRtl?: ContentModelFormatContainerFormat
) {
    const fullQuoteFormatLtr: ContentModelFormatContainerFormat = {
        // todo: xmail: 引用块只保留标签不写默认样式，样式由编辑器样式文件控制，方便各端展示时应用自己的默认样式
        // ...BuildInQuoteFormat,
        // paddingLeft: '10px',
        ...(quoteFormat ?? DefaultQuoteFormatLtr),
    };
    const fullQuoteFormatRtl: ContentModelFormatContainerFormat = {
        // todo: xmail: 引用块只保留标签不写默认样式，样式由编辑器样式文件控制，方便各端展示时应用自己的默认样式
        // ...BuildInQuoteFormat,
        // paddingRight: '10px',
        direction: 'rtl',
        ...(quoteFormatRtl ?? quoteFormat ?? DefaultQuoteFormatRtl),
    };

    editor.focus();

    editor.formatContentModel(
        (model, context) => {
            context.newPendingFormat = 'preserve';

            return toggleModelBlockQuote(model, fullQuoteFormatLtr, fullQuoteFormatRtl);
        },
        {
            apiName: 'toggleBlockQuote',
        }
    );
}
