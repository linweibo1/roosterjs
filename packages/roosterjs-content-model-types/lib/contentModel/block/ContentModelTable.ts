import type {
    ContentModelBlockBase,
    ReadonlyContentModelBlockBase,
    ShallowMutableContentModelBlockBase,
} from './ContentModelBlockBase';
import type { ContentModelTableFormat } from '../format/ContentModelTableFormat';
import type {
    ContentModelTableRow,
    ReadonlyContentModelTableRow,
    ShallowMutableContentModelTableRow,
} from './ContentModelTableRow';
import type {
    ContentModelWithDataset,
    ReadonlyContentModelWithDataset,
    ShallowMutableContentModelWithDataset,
} from '../format/ContentModelWithDataset';
import type { TableMetadataFormat } from '../format/metadata/TableMetadataFormat';

/**
 * Content Model of Table
 */
export interface ContentModelTable
    extends ContentModelBlockBase<'Table', ContentModelTableFormat, HTMLTableElement>,
        ContentModelWithDataset<TableMetadataFormat> {
    /**
     * Widths of each column
     */
    widths: number[];

    /**
     * Cells of this table
     */
    rows: ContentModelTableRow[];

    // todo: xmail: 支持表格的border、cellspacing、cellpadding
    border?: string;
    cellSpacing?: string;
    cellPadding?: string;
}

/**
 * Content Model of Table (Readonly)
 */
export interface ReadonlyContentModelTable
    extends ReadonlyContentModelBlockBase<'Table', ContentModelTableFormat, HTMLTableElement>,
        ReadonlyContentModelWithDataset<TableMetadataFormat> {
    /**
     * Widths of each column
     */
    readonly widths: ReadonlyArray<number>;

    /**
     * Cells of this table
     */
    readonly rows: ReadonlyArray<ReadonlyContentModelTableRow>;

    // todo: xmail: 支持表格的border、cellspacing、cellpadding
    readonly border?: string;
    readonly cellSpacing?: string;
    readonly cellPadding?: string;
}

/**
 * Content Model of Table (Shallow mutable)
 */
export interface ShallowMutableContentModelTable
    extends ShallowMutableContentModelBlockBase<'Table', ContentModelTableFormat, HTMLTableElement>,
        ShallowMutableContentModelWithDataset<TableMetadataFormat> {
    /**
     * Widths of each column
     */
    widths: number[];

    /**
     * Cells of this table
     */
    rows: ShallowMutableContentModelTableRow[];

    // todo: xmail: 支持表格的border、cellspacing、cellpadding
    border?: string;
    cellSpacing?: string;
    cellPadding?: string;
}
