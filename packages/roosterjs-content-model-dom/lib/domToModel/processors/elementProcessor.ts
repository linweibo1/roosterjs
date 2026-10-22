import { isEntityDelimiter, isEntityElement } from '../../domUtils/entityUtils';
import type {
    DomToModelContext,
    ElementProcessor,
    ElementProcessorMap,
} from 'roosterjs-content-model-types';

/**
 * @internal
 * @param group
 * @param element
 * @param context
 */
export const elementProcessor: ElementProcessor<HTMLElement> = (group, element, context) => {
    const tagName = element.tagName.toLowerCase() as keyof ElementProcessorMap;
    const processor = (tryGetProcessorForEntity(element, context) ||
        tryGetProcessorForDelimiter(element, context) ||
        context.elementProcessors[tagName] ||
        (tagName.indexOf(':') >= 0 && context.elementProcessors.child) ||
        context.elementProcessors['*']) as ElementProcessor<Node>;
    processor(group, element, context);
};

function tryGetProcessorForEntity(element: HTMLElement, context: DomToModelContext) {
    // return isEntityElement(element) || element.contentEditable == 'false' // For readonly element, treat as an entity
    //     ? context.elementProcessors.entity
    //     : null;

    // todo: xmail: 音频是原子媒体，自身没有文本位置：按普通片段处理时，段落末尾没有能放光标的地方，音频后面既不能输入也删不掉。
    //  按实体处理后可落在它前后，也能整块删除；渲染时自动带上 `contenteditable="false"`，不产生实体类名与分隔符，正文结构保持不变
    return isEntityElement(element) ||
        element.contentEditable == 'false' ||
        element.tagName == 'AUDIO'
        ? context.elementProcessors.entity
        : null;
}

function tryGetProcessorForDelimiter(element: HTMLElement, context: DomToModelContext) {
    return isEntityDelimiter(element) ? context.elementProcessors.delimiter : null;
}
