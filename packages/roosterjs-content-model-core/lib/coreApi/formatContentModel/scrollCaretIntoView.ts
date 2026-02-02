import { getDOMInsertPointRect, scrollRectIntoView } from 'roosterjs-content-model-dom';
import type { EditorCore, ImageSelection, RangeSelection } from 'roosterjs-content-model-types';

/**
 * @internal
 */
export function scrollCaretIntoView(core: EditorCore, selection: RangeSelection | ImageSelection) {
    const rect = getDOMInsertPointRect(
        core.physicalRoot.ownerDocument,
        selection.type == 'image'
            ? {
                  node: selection.image,
                  offset: 0,
              }
            : selection.isReverted
            ? {
                  node: selection.range.startContainer,
                  offset: selection.range.startOffset,
              }
            : {
                  node: selection.range.endContainer,
                  offset: selection.range.endOffset,
              }
    );
    const visibleRect = core.api.getVisibleViewport(core);
    const scrollContainer = core.domEvent.scrollContainer;

    if (rect && visibleRect) {
        // todo: xmail: 粘贴之后光标离滚动容器底部要保持一定距离，避免选择性粘贴按钮被挡住
        const bottomOffset = 60;
        scrollRectIntoView(scrollContainer, visibleRect, core.domHelper, rect, bottomOffset);
    }
}
