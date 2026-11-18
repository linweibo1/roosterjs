import { cleanUpRestNodes } from '../utils/cleanUpRestNodes';
import type {
    ContentModelBlockGroup,
    ContentModelHandler,
    ModelToDomContext,
    ModelToDomListStackItem,
} from 'roosterjs-content-model-types';

/**
 * @internal
 */
export const handleBlockGroupChildren: ContentModelHandler<ContentModelBlockGroup> = (
    doc: Document,
    parent: Node,
    group: ContentModelBlockGroup,
    context: ModelToDomContext
) => {
    const { listFormat } = context;
    const nodeStack = listFormat.nodeStack;
    let refNode: Node | null = parent.firstChild;

    try {
        group.blocks.forEach((childBlock, index) => {
            // When process list, we need a node stack.
            // When there are two continuous lists, they should share the same stack
            // so that list items with same type/threadId can be merged into the same list element
            // In other cases, clear the stack so that two separate lists won't share the same list element
            if (
                index == 0 ||
                childBlock.blockType != 'BlockGroup' ||
                childBlock.blockGroupType != 'ListItem'
            ) {
                cleanUpNodeStack(listFormat.nodeStack, context);

                if (listFormat.nodeStack.length > 0) {
                    listFormat.nodeStack = [];
                }
            }

            refNode = context.modelHandlers.block(doc, parent, childBlock, context, refNode);

            if (childBlock.blockType == 'Entity') {
                context.domIndexer?.onBlockEntity(childBlock, group);
            }
        });

        // cleanUpNodeStack(listFormat.nodeStack, context);
        // todo: xmail: 离开块组时若列表栈底容器就是该块组则整栈已失效，需清空防止泄漏给后续兄弟块，否则引用块后的列表项会被建进引用块内且旧节点不被清理，内容多出一倍
        cleanUpNodeStack(listFormat.nodeStack, context, parent);

        // Remove all rest node if any since they don't appear in content model
        cleanUpRestNodes(refNode, context.rewriteFromModel);
    } finally {
        listFormat.nodeStack = nodeStack;
    }
};

// function cleanUpNodeStack(nodeStack: ModelToDomListStackItem[], context: ModelToDomContext) {
// todo: xmail: 离开块组时若列表栈底容器就是该块组则整栈已失效，需清空防止泄漏给后续兄弟块，否则引用块后的列表项会被建进引用块内且旧节点不被清理，内容多出一倍
function cleanUpNodeStack(
    nodeStack: ModelToDomListStackItem[],
    context: ModelToDomContext,
    leavingParent?: Node
) {
    if (context.allowCacheListItem && nodeStack.length > 0) {
        // Clear list stack, only run to nodeStack[1] because nodeStack[0] is the parent node
        for (let i = nodeStack.length - 1; i > 0; i--) {
            const node = nodeStack.pop()?.refNode ?? null;

            cleanUpRestNodes(node, context.rewriteFromModel);
        }
    }

    // todo: xmail: 离开块组时若列表栈底容器就是该块组则整栈已失效，需清空防止泄漏给后续兄弟块，否则引用块后的列表项会被建进引用块内且旧节点不被清理，内容多出一倍
    if (leavingParent && nodeStack.length > 0 && nodeStack[0].node == leavingParent) {
        while (nodeStack.length > 0) {
            nodeStack.pop();
        }
    }
}
