import { getObjectKeys } from '../../domUtils/getObjectKeys';
import type { DatasetFormat } from 'roosterjs-content-model-types';
import type { FormatHandler } from '../FormatHandler';

/**
 * @internal
 */
export const datasetFormatHandler: FormatHandler<DatasetFormat> = {
    parse: (format, element) => {
        const dataset = element.dataset;

        getObjectKeys(dataset).forEach(key => {
            format[key] = dataset[key] || '';
        });
    },

    apply: (format, element) => {
        // todo: xmail: 为了实现todolist功能，列表项支持data-*属性（dataset），删除dataset键后apply同步清除DOM上已不存在的data属性，避免复用元素上残留旧属性
        getObjectKeys(element.dataset).forEach(key => {
            if (!Object.prototype.hasOwnProperty.call(format, key)) {
                delete element.dataset[key];
            }
        });

        getObjectKeys(format).forEach(key => {
            element.dataset[key] = format[key];
        });
    },
};
