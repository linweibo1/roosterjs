# RoosterJS 包使用说明

## 基本信息

-   **最后更新时间**：2025-05-08
-   **版本**：9.25.0
-   **源码地址**：[roosterjs GitHub](https://github.com/microsoft/roosterjs)

## 使用说明

1. 从 `packages` 目录下复制这些库过来，并删除其中的 `test` 文件夹
2. 由于 `rooster-editor-adapter` 还需要用到旧的库，项目的 `package.json` 增加了：
    ```
    "roosterjs-editor-adapter": "^8.62.1"
    ```
3. `packages` 目录已计入 `.eslintignore`
4. 需要在 webpack 中 resolve 增加这些配置项：
    ```
    'roosterjs-content-model-api': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-api'),
    'roosterjs-content-model-core': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-core'),
    'roosterjs-content-model-dom': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-dom'),
    'roosterjs-content-model-plugins': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-plugins'),
    'roosterjs-content-model-types': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-types'),
    'roosterjs-editor-adapter': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-editor-adapter'),
    ```

## 源码修改记录

### 1. 表情图片样式处理

-   保留表情图片基本样式
    -   [ImageEditPlugin.ts](roosterjs-content-model-plugins/lib/imageEdit/ImageEditPlugin.ts)
    -   [clearModelFormat.ts](roosterjs-content-model-api/lib/modelApi/common/clearModelFormat.ts)
    -   [verticalAlignFormatHandler.ts](roosterjs-content-model-dom/lib/formatHandlers/common/verticalAlignFormatHandler.ts)

### 2. 图片编辑优化

-   图片调整了大小后需要去掉宽高限制，保证图片不变形
-   右键菜单时退出图片编辑，方便右键菜单逻辑的实现
-   有高低两个图片并排时，选中图片之后要保持对齐方式避免跳动，也要避免上下图片之间留缝隙
-   调整操作手柄样式、支持隐藏侧边手柄
-   给 shadowSpan 增加一个属性避免被编辑器过滤掉导致操作手柄不可见
-   带有`data-uneditable="true"`标记的图片不可编辑（如表情图片、地图图片等）
-   临时解决在图片右键时无法退出图片编辑的问题
    -   [applyChange.ts](roosterjs-content-model-plugins/lib/imageEdit/utils/applyChange.ts)
    -   [ImageEditPlugin.ts](roosterjs-content-model-plugins/lib/imageEdit/ImageEditPlugin.ts)
    -   [createImageWrapper.ts](roosterjs-content-model-plugins/lib/imageEdit/utils/createImageWrapper.ts)
    -   [createImageResizer.ts](roosterjs-content-model-plugins/lib/imageEdit/Resizer/createImageResizer.ts)

### 3. 删除内容后保留 br

-   删除全部内容之后最后的 br 要保留，否则比如空白编辑器中插入分割线之后删除，br 一起被删除， 此时光标在火狐浏览器中太偏上，而且插入“引用”时会因为没有 br 而导致内容为空而看不见引用标签
    -   [deleteCollapsedSelection.ts](roosterjs-content-model-plugins/lib/edit/deleteSteps/deleteCollapsedSelection.ts)

### 4. 项目编号格式保持

-   新增的项目编号应该保持跟上一项一样的格式（比如居中）
    -   [handleEnterOnList.ts](roosterjs-content-model-plugins/lib/edit/inputSteps/handleEnterOnList.ts)

### 5. 表格插件优化

-   调整表格插件的操作手柄样式
-   带有`data-uneditable="true"`标记的表格不可编辑（比如转发邮件时的邮件基本信息）
    -   [CellResizer.ts](roosterjs-content-model-plugins/lib/tableEdit/editors/features/CellResizer.ts)
    -   [TableEditPlugin.ts](roosterjs-content-model-plugins/lib/tableEdit/TableEditPlugin.ts)

### 6. 表格选区底色

-   解决表格选区底色跟内容叠加的问题，只保留一个底色
    -   [setDOMSelection.ts](roosterjs-content-model-core/lib/coreApi/setDOMSelection/setDOMSelection.ts)

### 7. 表格属性支持

-   支持表格的 border、cellspacing、cellpadding
    -   [sanitizeElement.ts](roosterjs-content-model-core/lib/command/createModelFromHtml/sanitizeElement.ts)
    -   [tableProcessor.ts](roosterjs-content-model-dom/lib/domToModel/processors/tableProcessor.ts)
    -   [cloneModel.ts](roosterjs-content-model-dom/lib/modelApi/editing/cloneModel.ts)
    -   [handleTable.ts](roosterjs-content-model-dom/lib/modelToDom/handlers/handleTable.ts)
    -   [ContentModelTable.ts](roosterjs-content-model-types/lib/contentModel/block/ContentModelTable.ts)

### 8. 表格自定义单元格格式支持

-   插入单元格时支持定义单元格样式
    -   [insertTable.ts](roosterjs-content-model-api/lib/publicApi/table/insertTable.ts)
    -   [createTableStructure.ts](roosterjs-content-model-api/lib/modelApi/table/createTableStructure.ts)

### 9. 焦点和滚动问题

-   解决正文很长时，在尾部 ctrl+a 再 ctrl+c 时编辑器会滚到顶部的问题
-   解决编辑器 focus 时滚动条自动滚动的问题
-   粘贴之后光标离滚动容器底部要保持一定距离，避免选择性粘贴按钮被挡住
    -   [CopyPastePlugin.ts](roosterjs-content-model-core/lib/corePlugin/copyPaste/CopyPastePlugin.ts)
    -   [focus.ts](roosterjs-content-model-core/lib/coreApi/focus/focus.ts)
    -   [scrollCaretIntoView.ts](roosterjs-content-model-core/lib/coreApi/formatContentModel/scrollCaretIntoView.ts)

### 10. 低端浏览器兼容

-   解决低端浏览器（如 windows 的 QQ 浏览器）的报错问题（点击图片时图片编辑插件报错）：
-   ```
    setEditorStyle.ts:52 Uncaught DOMException: Failed to execute 'insertRule' on 'CSSStyleSheet': Failed to parse the rule '#contentDiv_0 span:has(>img#image_0) {outline-style:none!important;}'.
    ```
    -   [setEditorStyle.ts](roosterjs-content-model-core/lib/coreApi/setEditorStyle/setEditorStyle.ts)

### 11. 音频标签支持

-   允许音频标签
    -   [sanitizeElement.ts](roosterjs-content-model-core/lib/command/createModelFromHtml/sanitizeElement.ts)

### 12. 样式转换函数导出

-   导出转换 style 标签为行内样式的函数供外部使用
    -   [index.ts](roosterjs-content-model-core/lib/index.ts)

### 13. 居中格式清除

-   编辑器内容为空时设置居中再清除格式，应该能清除掉居中
    -   [clearModelFormat.ts](roosterjs-content-model-api/lib/modelApi/common/clearModelFormat.ts)

### 14. 项目编号缩进

-   缩进步长改为 28px，默认字号通常是 14，缩进应该是 2 个字符
    -   [setModelIndentation.ts](roosterjs-content-model-api/lib/modelApi/block/setModelIndentation.ts)
-   在某个项目编号中一直减少缩进，要保持不退出项目编号
    -   [setModelIndentation.ts](roosterjs-content-model-api/lib/modelApi/block/setModelIndentation.ts)

### 15. 粘贴排除文件夹

-   在编辑器中粘贴时要排除文件夹
    -   [extractClipboardItems.ts](roosterjs-content-model-dom/lib/domUtils/event/extractClipboardItems.ts)

### 16. Redo 快捷键兼容

-   mac 下 command + y 也可以执行 redo
    -   [shortcuts.ts](roosterjs-content-model-plugins/lib/shortcut/shortcuts.ts)

### 17. 字体大小映射兼容

-   修改字体大小转换映射表，确保转换前后在浏览器视觉上大小一致
    -   [fontSizeFormatHandler.ts](roosterjs-content-model-dom/lib/formatHandlers/segment/fontSizeFormatHandler.ts)

### 18. 段落标签优化

-   将段落标签从`p`改为`div`，避免复制内容粘贴到记事本时每个标签后面都多一个换行
    -   [setParagraphMargin.ts](roosterjs-content-model-api/lib/publicApi/block/setParagraphMargin.ts)
