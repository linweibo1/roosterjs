# RoosterJS 包使用说明

## 基本信息（每次 Sync fork 时才修改）

-   **最后更新时间**：2026-02-02
-   **版本**：9.45.2
-   **源码地址**：[roosterjs GitHub](https://github.com/linweibo1/roosterjs)

## 使用说明

1. 从 `packages` 目录下复制这些库过来，执行 `cleanup-packages.js` 清理（删除未保留的包、各包的 test 目录 / package.json / node_modules，并把包间引用改为相对路径）
2. `packages` 目录已计入 `.eslintignore`
3. 包之间的相互引用统一改为相对路径形式（例如 `from '../../roosterjs-content-model-dom/lib/index'`），不依赖 webpack alias；包内文件不参与 npm 解析，`roosterjs-color-utils` 依赖的 npm 包 `color` 已声明在项目根 `package.json`
4. v9 版本不提供 setContent / insertContent / addUndoSnapshot 等命令式 API，这些方法在 `Editor/rooster.ts` 内基于 v9 原生 `Editor` 内联实现

## 源码修改记录

### 1. 表情图片样式处理

-   保留表情图片基本样式
    -   [ImageEditPlugin.ts](roosterjs-content-model-plugins/lib/imageEdit/ImageEditPlugin.ts)
    -   [clearModelFormat.ts](roosterjs-content-model-api/lib/modelApi/common/clearModelFormat.ts)
    -   [verticalAlignFormatHandler.ts](roosterjs-content-model-dom/lib/formatHandlers/common/verticalAlignFormatHandler.ts)

### 2. 图片编辑优化

-   图片调整了大小后需要去掉宽高限制，保证图片不变形
-   右键菜单时退出图片编辑，方便右键菜单逻辑的实现
-   有高低两个图片并排时，选中图片之后要保持 margin 和对齐方式避免跳动，也要避免上下图片之间留缝隙
-   调整操作手柄样式、支持隐藏侧边手柄
-   给 shadowSpan 增加一个属性避免被编辑器过滤掉导致操作手柄不可见
-   带有`data-uneditable="true"`标记的图片不可编辑（如表情图片、地图图片等）
-   临时解决在图片右键时无法退出图片编辑的问题
    -   [applyChange.ts](roosterjs-content-model-plugins/lib/imageEdit/utils/applyChange.ts)
    -   [updateWrapper.ts](roosterjs-content-model-plugins/lib/imageEdit/utils/updateWrapper.ts)
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

### 8. 焦点和滚动问题

-   解决正文很长时，在尾部 ctrl+a 再 ctrl+c 时编辑器会滚到顶部的问题
-   解决编辑器 focus 时滚动条自动滚动的问题
-   粘贴之后光标离滚动容器底部要保持一定距离，避免选择性粘贴按钮被挡住
    -   [focus.ts](roosterjs-content-model-core/lib/coreApi/focus/focus.ts)
    -   [scrollCaretIntoView.ts](roosterjs-content-model-core/lib/coreApi/formatContentModel/scrollCaretIntoView.ts)
-   解决窗口失焦期间滚动后，回焦时滚动条跳回失焦时位置的问题：窗口失焦时 activeElement 仍在编辑器内，滚动时需同时判断文档焦点才会刷新滚动位置缓存
    -   [SelectionPlugin.ts](roosterjs-content-model-core/lib/corePlugin/selection/SelectionPlugin.ts)

### 9. 低端浏览器兼容

-   解决低端浏览器（如 windows 的 QQ 浏览器）的报错问题（点击图片时图片编辑插件报错）：
-   ```
    setEditorStyle.ts:52 Uncaught DOMException: Failed to execute 'insertRule' on 'CSSStyleSheet': Failed to parse the rule '#contentDiv_0 span:has(>img#image_0) {outline-style:none!important;}'.
    ```
    -   [setEditorStyle.ts](roosterjs-content-model-core/lib/coreApi/setEditorStyle/setEditorStyle.ts)

### 10. 音频标签支持

-   允许音频标签
    -   [sanitizeElement.ts](roosterjs-content-model-core/lib/command/createModelFromHtml/sanitizeElement.ts)

### 11. 样式转换函数导出

-   导出转换 style 标签为行内样式的函数供外部使用
    -   [index.ts](roosterjs-content-model-core/lib/index.ts)

### 12. 项目编号缩进

-   缩进步长改为 28px，默认字号通常是 14，缩进应该是 2 个字符
    -   [adjustIndentation.ts](roosterjs-content-model-api/lib/modelApi/common/adjustIndentation.ts)
-   在某个项目编号中一直减少缩进，要保持不退出项目编号
    -   [setModelIndentation.ts](roosterjs-content-model-api/lib/modelApi/block/setModelIndentation.ts)

### 13. 粘贴排除文件夹

-   在编辑器中粘贴时要排除文件夹
    -   [extractClipboardItems.ts](roosterjs-content-model-dom/lib/domUtils/event/extractClipboardItems.ts)

### 14. Redo 快捷键兼容

-   mac 下 command + y 也可以执行 redo
    -   [shortcuts.ts](roosterjs-content-model-plugins/lib/shortcut/shortcuts.ts)

### 15. 字体大小映射兼容

-   修改字体大小转换映射表，确保转换前后在浏览器视觉上大小一致
    -   [fontSizeFormatHandler.ts](roosterjs-content-model-dom/lib/formatHandlers/segment/fontSizeFormatHandler.ts)

### 16. 无障碍元素导致滚动条

-   解决 ariaLive 元素插入 body 后因缺少定位属性导致 body 出现滚动条的问题
    -   [createAriaLiveElement.ts](roosterjs-content-model-core/lib/utils/createAriaLiveElement.ts)

### 17. 设置标题时清除段落级格式

-   段落的 segmentFormat 会渲染到标题标签的行内样式且顺序在装饰格式之后，会覆盖标题标签的默认字号、字重和行高，导致设置标题后字号不变，设置标题时一并清除
    -   [setHeadingLevel.ts](roosterjs-content-model-api/lib/publicApi/block/setHeadingLevel.ts)

### 18. 列表项 data 属性支持

-   为了实现 todolist 功能，列表项支持 data-\*属性（dataset）
    -   [ContentModelListItem.ts](roosterjs-content-model-types/lib/contentModel/blockGroup/ContentModelListItem.ts)
    -   [createListItem.ts](roosterjs-content-model-dom/lib/modelApi/creators/createListItem.ts)
    -   [listItemProcessor.ts](roosterjs-content-model-dom/lib/domToModel/processors/listItemProcessor.ts)
    -   [handleListItem.ts](roosterjs-content-model-dom/lib/modelToDom/handlers/handleListItem.ts)
    -   [datasetFormatHandler.ts](roosterjs-content-model-dom/lib/formatHandlers/common/datasetFormatHandler.ts)
    -   [cloneModel.ts](roosterjs-content-model-dom/lib/modelApi/editing/cloneModel.ts)
-   列表级 data 不同的项要拆成独立列表，否则清掉待办标记后仍会并回原列表，列表上的属性无法单独去掉
    -   [handleList.ts](roosterjs-content-model-dom/lib/modelToDom/handlers/handleList.ts)

### 19. id 选择器转义

-   邮箱 app 插入的图片 id 是文件名（含"."、"("等字符），直接拼 #id 选择器非法，转义非[-_a-zA-Z0-9]字符使选择器合法
    -   [getSafeIdSelector.ts](roosterjs-content-model-dom/lib/domUtils/getSafeIdSelector.ts)

### 20. 引用块去默认样式

-   引用块只保留标签不写默认样式，样式统一由编辑器样式文件控制，方便各端展示时应用自己的默认样式
    -   [toggleBlockQuote.ts](roosterjs-content-model-api/lib/publicApi/block/toggleBlockQuote.ts)
    -   [defaultContentModelFormatMap.ts](roosterjs-content-model-dom/lib/config/defaultContentModelFormatMap.ts)
    -   [defaultHTMLStyleMap.ts](roosterjs-content-model-dom/lib/config/defaultHTMLStyleMap.ts)
    -   [knownElementProcessor.ts](roosterjs-content-model-dom/lib/domToModel/processors/knownElementProcessor.ts)

### 21. 粘贴解析不激活资源与脚本

-   粘贴解析时剥离节点的事件属性（如 img 的 onerror），并让 fragment 按剪贴板 html 的惰性文档创建，避免解析阶段执行脚本（剪贴板 xss）、加载图片等资源
    -   [paste.ts](roosterjs-content-model-core/lib/command/paste/paste.ts)

### 22. 粘贴选项按钮提前出现

-   粘贴被插件拦截（内容未合并）时不发 contentChanged，避免粘贴选项按钮提前出现
    -   [mergePasteContent.ts](roosterjs-content-model-core/lib/command/paste/mergePasteContent.ts)

### 23. 音频按实体处理

-   音频是原子媒体，自身没有文本位置：按普通片段处理时，段落末尾没有能放光标的地方，音频后面既不能输入也删不掉。按实体处理后可落在它前后，也能整块删除；渲染时自动带上 `contenteditable="false"`，不产生实体类名与分隔符，正文结构保持不变
    -   [elementProcessor.ts](roosterjs-content-model-dom/lib/domToModel/processors/elementProcessor.ts)

### 24. 焦点恢复选区后清除选区缓存

-   恢复选区后只清除 range 型缓存，image/table 型残留会让后续选区设置失效幂等判断，并在图片编辑态重写 DOM 时触发滚动锚定错误补偿导致视口跳变
    -   [SelectionPlugin.ts](roosterjs-content-model-core/lib/corePlugin/selection/SelectionPlugin.ts)
