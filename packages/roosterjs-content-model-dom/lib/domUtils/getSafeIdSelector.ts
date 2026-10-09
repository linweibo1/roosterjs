const StartsWithUnsupportedCharacter = /^[.|\-|_|\d]/;

/**
 * Returns a safe Id to use in Native APIs.
 * IDs that start with number or hyphen can throw errors if used.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/id
 * @param id
 * @returns
 */
export function getSafeIdSelector(id: string) {
    if (!id) {
        return id;
    }

    if (id.match(StartsWithUnsupportedCharacter)) {
        return `[id="${id}"]`;
    } else {
        // todo: xmail：邮箱app插入的图片id是文件名（含"."、"("等字符），直接拼#id选择器非法，转义非[-_a-zA-Z0-9]字符使选择器合法
        return `#${id.replace(/[^a-zA-Z0-9_-]/g, ch => `\\${ch}`)}`;
    }
}
