import { isSuperOrSubScript } from './superOrSubScriptFormatHandler';
import { parseValueWithUnit } from '../utils/parseValueWithUnit';
import type { EditorContext, FontSizeFormat } from 'roosterjs-content-model-types';
import type { FormatHandler } from '../FormatHandler';

/**
 * @internal
 */
export const fontSizeFormatHandler: FormatHandler<FontSizeFormat> = {
    parse: (format, element, context, defaultStyle) => {
        const fontSize = element.style.fontSize || defaultStyle.fontSize;
        const verticalAlign = element.style.verticalAlign || defaultStyle.verticalAlign;

        // when font size is 'smaller' and the style is for superscript/subscript,
        // the font size will be handled by superOrSubScript handler
        if (fontSize && !isSuperOrSubScript(fontSize, verticalAlign) && fontSize != 'inherit') {
            if (element.style.fontSize) {
                format.fontSize = normalizeFontSize(
                    fontSize,
                    context.segmentFormat.fontSize,
                    context
                );
            } else if (defaultStyle.fontSize) {
                format.fontSize = fontSize;
            }
        }
    },
    apply: (format, element, context) => {
        if (format.fontSize && format.fontSize != context.implicitFormat.fontSize) {
            element.style.fontSize = format.fontSize;
        }
    },
};

// https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
const KnownFontSizes: Record<string, string> = {
    // todo: xmail: 修改字体大小转换映射表，确保转换前后在浏览器视觉上大小一致
    'xx-small': '12px', // '6.75pt',
    'x-small': '12px', // '7.5pt',
    small: '13px', // '9.75pt',
    medium: '16px', // '12pt',
    large: '18px', // '13.5pt',
    'x-large': '24px', // '18pt',
    'xx-large': '32px', // '24pt',
    'xxx-large': '48px', // '36pt',
};

function normalizeFontSize(
    fontSize: string,
    contextFont: string | undefined,
    context: EditorContext
): string | undefined {
    const knownFontSize = KnownFontSizes[fontSize];
    const isRemUnit = fontSize.endsWith('rem');

    if (knownFontSize) {
        return knownFontSize;
    } else if (
        fontSize == 'smaller' ||
        fontSize == 'larger' ||
        fontSize.endsWith('em') ||
        fontSize.endsWith('%') ||
        isRemUnit
    ) {
        if (!contextFont && !isRemUnit) {
            return undefined;
        } else {
            const existingFontSize = isRemUnit
                ? context.rootFontSize
                : parseValueWithUnit(contextFont);

            if (existingFontSize) {
                switch (fontSize) {
                    case 'smaller':
                        return Math.round((existingFontSize * 500) / 6) / 100 + 'px';
                    case 'larger':
                        return Math.round((existingFontSize * 600) / 5) / 100 + 'px';
                    default:
                        return parseValueWithUnit(fontSize, existingFontSize, 'px') + 'px';
                }
            }
        }
    } else if (fontSize == 'inherit' || fontSize == 'revert' || fontSize == 'unset') {
        return undefined;
    } else {
        return fontSize;
    }
}
