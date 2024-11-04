1、源码：https://github.com/microsoft/roosterjs/tree/v9.13.0

2、从它的packages目录下把这些库copy过来，删除了里面的test文件夹

3、由于rooster-editor-adapter还需要用到旧的库，所以项目的package.json增加了 "roosterjs-editor-adapter": "^8.62.1"

4、packages目录已计入.eslintignore

5、为了让它能跑起来，需要在webpack中resolve增加这些配置项：
'roosterjs-content-model-api': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-api'),
'roosterjs-content-model-core': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-core'),
'roosterjs-content-model-dom': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-dom'),
'roosterjs-content-model-plugins': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-plugins'),
'roosterjs-content-model-types': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-content-model-types'),
'roosterjs-editor-adapter': path.resolve(__dirname, '../src/mail/projects/web/components2/XmailEditor/Editor/packages/roosterjs-editor-adapter'),



源码修改记录：
1、保留表情图片基本样式
   [1](roosterjs-content-model-plugins/lib/imageEdit/ImageEditPlugin.ts)
   [2](roosterjs-content-model-api/lib/modelApi/common/clearModelFormat.ts)
   [3](roosterjs-content-model-dom/lib/formatHandlers/common/verticalAlignFormatHandler.ts)

2、a、右键菜单时退出图片编辑，方便右键菜单逻辑的实现
   b、有高低两个图片并排时，选中图片之后要保持对齐方式避免跳动
   c、调整操作句柄样式、支持隐藏侧边句柄
   d、给shadowSpan增加一个属性避免被编辑器过滤掉导致操作手柄不可见
   [1](roosterjs-content-model-plugins/lib/imageEdit/ImageEditPlugin.ts)
   [2](roosterjs-content-model-plugins/lib/imageEdit/utils/createImageWrapper.ts)
   [3](roosterjs-content-model-plugins/lib/imageEdit/Resizer/createImageResizer.ts)

3、删除全部内容之后最后的br要保留，否则比如空白编辑器中插入分割线之后删除，br一起被删除，
   此时光标在火狐浏览器中太偏上，而且插入“引用”时会因为没有br而导致内容为空而看不见引用标签
   [1](roosterjs-content-model-plugins/lib/edit/deleteSteps/deleteCollapsedSelection.ts)

4、新增的项目编号应该保持跟上一项一样的格式（比如居中）
   [1](roosterjs-content-model-plugins/lib/edit/inputSteps/handleEnterOnList.ts)

5、调整表格插件的操作手柄样式
   [1](roosterjs-content-model-plugins/lib/tableEdit/editors/features/CellResizer.ts)

6、正文很长时，在尾部ctrl+a，再ctrl+c时编辑器会滚到顶部
   [1](roosterjs-content-model-core/lib/corePlugin/copyPaste/CopyPastePlugin.ts)

7、解决编辑器focus时滚动条自动滚动的问题
   [1](roosterjs-content-model-core/lib/coreApi/focus/focus.ts)

8、编辑器内容为空时设置居中再清除格式，应该能清除掉居中
   [1](roosterjs-content-model-api/lib/modelApi/common/clearModelFormat.ts)

9、在某个项目编号中一直减少缩进，要保持不退出项目编号
   [1](roosterjs-content-model-api/lib/modelApi/block/setModelIndentation.ts)
