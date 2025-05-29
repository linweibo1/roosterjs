import { createElement } from '../../pluginUtils/CreateElement/createElement';
import { ImageEditElementClass } from '../types/ImageEditElementClass';
import { isElementOfType, isNodeOfType } from 'roosterjs-content-model-dom';
import { Xs, Ys } from '../constants/constants';
import type { CreateElementData } from '../../pluginUtils/CreateElement/CreateElementData';
import type { DNDDirectionX, DnDDirectionY } from '../types/DragAndDropContext';

// todo: xmail: 调整操作手柄样式
import type { ImageEditOptions } from '../types/ImageEditOptions';

/**
 * @internal
 */
export interface OnShowResizeHandle {
    (elementData: CreateElementData, x: DNDDirectionX, y: DnDDirectionY): void;
}

// todo: xmail: 调整操作手柄样式
const RESIZE_HANDLE_MARGIN = 9;
const RESIZE_HANDLE_SIZE = 12;

/**
 * @internal
 */
export function createImageResizer(
    doc: Document,
    // todo: xmail: 调整操作手柄样式
    options: ImageEditOptions,
    onShowResizeHandle?: OnShowResizeHandle
): HTMLDivElement[] {
    // todo: xmail: 调整操作手柄样式
    const cornerElements = getCornerResizeHTML(options, onShowResizeHandle);
    // todo: xmail: 支持隐藏侧边手柄
    const sideElements = options.disableSideResize
        ? []
        : getSideResizeHTML(options, onShowResizeHandle);
    const handles = [...cornerElements, ...sideElements]
        .map(element => {
            const handle = createElement(element, doc);
            if (isNodeOfType(handle, 'ELEMENT_NODE') && isElementOfType(handle, 'div')) {
                return handle;
            }
        })
        .filter(element => !!element) as HTMLDivElement[];
    return handles;
}

/**
 * @internal
 * Get HTML for resize handles at the corners
 * todo: xmail: 调整操作手柄样式
 */
function getCornerResizeHTML(
    options: ImageEditOptions,
    onShowResizeHandle?: OnShowResizeHandle
): CreateElementData[] {
    const result: CreateElementData[] = [];

    Xs.forEach(x =>
        Ys.forEach(y => {
            // todo: xmail: 调整操作手柄样式
            const elementData = (x == '') == (y == '') ? getResizeHandleHTML(x, y, options) : null;
            if (onShowResizeHandle && elementData) {
                onShowResizeHandle(elementData, x, y);
            }
            if (elementData) {
                result.push(elementData);
            }
        })
    );
    return result;
}

/**
 * @internal
 * Get HTML for resize handles on the sides
 * todo: xmail: 调整操作手柄样式
 */
function getSideResizeHTML(
    options: ImageEditOptions,
    onShowResizeHandle?: OnShowResizeHandle
): CreateElementData[] {
    const result: CreateElementData[] = [];
    Xs.forEach(x =>
        Ys.forEach(y => {
            // todo: xmail: 调整操作手柄样式
            const elementData = (x == '') != (y == '') ? getResizeHandleHTML(x, y, options) : null;
            if (onShowResizeHandle && elementData) {
                onShowResizeHandle(elementData, x, y);
            }
            if (elementData) {
                result.push(elementData);
            }
        })
    );
    return result;
}

// todo: xmail: 调整操作手柄样式
const createHandleStyle = (
    direction: string,
    topOrBottom: string,
    leftOrRight: string,
    options: ImageEditOptions
) => {
    return `position:relative;width:${RESIZE_HANDLE_SIZE}px;height:${RESIZE_HANDLE_SIZE}px;background-color: ${
        options.borderColor || '#DB626C'
    };cursor:${direction}-resize;${topOrBottom}:-${RESIZE_HANDLE_MARGIN}px;${leftOrRight}:-${RESIZE_HANDLE_MARGIN}px;border-radius:100%;border: 2px solid #fff;box-shadow: 0px 0.36316px 1.36185px rgba(100, 100, 100, 0.25);`;
};

// todo: xmail: 调整操作手柄样式
function getResizeHandleHTML(
    x: DNDDirectionX,
    y: DnDDirectionY,
    options: ImageEditOptions
): CreateElementData | null {
    const leftOrRight = x == 'w' ? 'left' : 'right';
    const topOrBottom = y == 'n' ? 'top' : 'bottom';
    const leftOrRightValue = x == '' ? '50%' : '0px';
    const topOrBottomValue = y == '' ? '50%' : '0px';
    const direction = y + x;
    return x == '' && y == ''
        ? null
        : {
              tag: 'div',
              style: `position:absolute;${leftOrRight}:${leftOrRightValue};${topOrBottom}:${topOrBottomValue}`,
              children: [
                  {
                      tag: 'div',
                      style: createHandleStyle(direction, topOrBottom, leftOrRight, options),
                      className: ImageEditElementClass.ResizeHandle,
                      dataset: { x, y },
                  },
              ],
          };
}
