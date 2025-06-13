import { addBlock, createTable, createTableCell } from 'roosterjs-content-model-dom';
// todo: xmail: 插入单元格时支持定义单元格样式
import type { ContentModelBlockGroup, ContentModelTable, ContentModelTableCellFormat } from 'roosterjs-content-model-types';

/**
 * @internal
 */
export function createTableStructure(
    parent: ContentModelBlockGroup,
    columns: number,
    rows: number,
    // todo: xmail: 插入单元格时支持定义单元格样式
    cellFormat?: ContentModelTableCellFormat,
): ContentModelTable {
    const table = createTable(rows);

    addBlock(parent, table);

    table.rows.forEach(row => {
        for (let i = 0; i < columns; i++) {
            const cell = createTableCell();

            // todo: xmail: 插入单元格时支持定义单元格样式
            Object.assign(cell.format, cellFormat);

            row.cells.push(cell);
        }
    });

    return table;
}
