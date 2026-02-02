import { ensureUniqueId } from './ensureUniqueId';
import { getSafeIdSelector } from 'roosterjs-content-model-dom';
import type { SetEditorStyle } from 'roosterjs-content-model-types';

const MAX_RULE_SELECTOR_LENGTH = 9000;
const CONTENT_DIV_ID = 'contentDiv';

/**
 * @internal
 */
export const setEditorStyle: SetEditorStyle = (
    core,
    key,
    cssRule,
    subSelectors,
    maxRuleLength = MAX_RULE_SELECTOR_LENGTH
) => {
    let styleElement = core.lifecycle.styleElements[key];

    if (!styleElement && cssRule) {
        const doc = core.physicalRoot.ownerDocument;

        styleElement = doc.createElement('style');
        doc.head.appendChild(styleElement);

        styleElement.dataset.roosterjsStyleKey = key;
        core.lifecycle.styleElements[key] = styleElement;
    }

    const sheet = styleElement?.sheet;

    if (sheet) {
        for (let i = sheet.cssRules.length - 1; i >= 0; i--) {
            sheet.deleteRule(i);
        }

        if (cssRule) {
            const rootSelector = getSafeIdSelector(
                ensureUniqueId(core.physicalRoot, CONTENT_DIV_ID)
            );
            const selectors = !subSelectors
                ? [rootSelector]
                : typeof subSelectors === 'string'
                ? [`${rootSelector}::${subSelectors}`]
                : buildSelectors(
                      rootSelector,
                      subSelectors,
                      maxRuleLength - cssRule.length - 3 // minus 3 for " {}"
                  );

            selectors.forEach(selector => {
                // todo: xmail: 解决低端浏览器（如windows的QQ浏览器）的报错问题（点击图片时图片编辑插件报错）
                // 报错信息：setEditorStyle.ts:52 Uncaught DOMException: Failed to execute 'insertRule' on 'CSSStyleSheet': Failed to parse the rule '#contentDiv_0 span:has(>img#image_0) {outline-style:none!important;}'.
                try {
                    sheet.insertRule(`${selector} {${cssRule}}`);
                } catch (e) {
                    console.error(e);
                }
            });
        }
    }
};

function buildSelectors(rootSelector: string, subSelectors: string[], maxLen: number): string[] {
    const result: string[] = [];

    let stringBuilder: string[] = [];
    let len = 0;

    subSelectors.forEach(subSelector => {
        if (len >= maxLen) {
            result.push(stringBuilder.join(','));
            stringBuilder = [];
            len = 0;
        }

        const selector = `${rootSelector} ${subSelector}`;

        len += selector.length + 1; // Add 1 for potential "," between selectors
        stringBuilder.push(selector);
    });

    result.push(stringBuilder.join(','));

    return result;
}
