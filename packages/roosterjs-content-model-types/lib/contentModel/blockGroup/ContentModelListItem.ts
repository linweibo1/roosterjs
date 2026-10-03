import type {
    ContentModelBlockBase,
    ReadonlyContentModelBlockBase,
    ShallowMutableContentModelBlockBase,
} from '../block/ContentModelBlockBase';
import type {
    ContentModelBlockGroupBase,
    ReadonlyContentModelBlockGroupBase,
    ShallowMutableContentModelBlockGroupBase,
} from './ContentModelBlockGroupBase';
import type { ContentModelListItemFormat } from '../format/ContentModelListItemFormat';
import type {
    ContentModelListLevel,
    ReadonlyContentModelListLevel,
} from '../decorator/ContentModelListLevel';
import type {
    ContentModelSelectionMarker,
    ReadonlyContentModelSelectionMarker,
} from '../segment/ContentModelSelectionMarker';

// todo: xmail: 为了实现todolist功能，列表项支持data-*属性（dataset）
import type {
    ContentModelWithDataset,
    ReadonlyContentModelWithDataset,
    ShallowMutableContentModelWithDataset,
} from '../format/ContentModelWithDataset';

/**
 * Content Model of List Item
 */
export interface ContentModelListItem
    extends ContentModelBlockGroupBase<'ListItem', HTMLLIElement>,
        ContentModelBlockBase<'BlockGroup', ContentModelListItemFormat, HTMLLIElement>,
        // todo: xmail: 为了实现todolist功能，列表项支持data-*属性（dataset）
        ContentModelWithDataset<null> {
    /**
     * Type of this list, either ordered or unordered
     */
    levels: ContentModelListLevel[];

    /**
     * A dummy segment to hold format of this list item
     */
    formatHolder: ContentModelSelectionMarker;
}

/**
 * Content Model of List Item (Readonly)
 */
export interface ReadonlyContentModelListItem
    extends ReadonlyContentModelBlockGroupBase<'ListItem', HTMLLIElement>,
        ReadonlyContentModelBlockBase<'BlockGroup', ContentModelListItemFormat, HTMLLIElement>,
        // todo: xmail: 为了实现todolist功能，列表项支持data-*属性（dataset）
        ReadonlyContentModelWithDataset<null> {
    /**
     * Type of this list, either ordered or unordered
     */
    readonly levels: ReadonlyArray<ReadonlyContentModelListLevel>;

    /**
     * A dummy segment to hold format of this list item
     */
    readonly formatHolder: ReadonlyContentModelSelectionMarker;
}

/**
 * Content Model of List Item (Shallow mutable)
 */
export interface ShallowMutableContentModelListItem
    extends ShallowMutableContentModelBlockGroupBase<'ListItem', HTMLLIElement>,
        ShallowMutableContentModelBlockBase<
            'BlockGroup',
            ContentModelListItemFormat,
            HTMLLIElement
        >,
        // todo: xmail: 为了实现todolist功能，列表项支持data-*属性（dataset）
        ShallowMutableContentModelWithDataset<null> {
    /**
     * Type of this list, either ordered or unordered
     */
    levels: ContentModelListLevel[];

    /**
     * A dummy segment to hold format of this list item
     */
    formatHolder: ContentModelSelectionMarker;
}
