/**
 * @desc: 清理 vendored 包中不需要的内容
 * 从 roosterjs 源仓库复制 packages 后，在本目录下执行：
 * 删除未保留的包，删除各包的 test 目录、package.json 与 tsconfig，并把包间引用改为相对路径
 */

const fs = require('fs');
const path = require('path');

// 要保存的包
const saveDirs = [
    'roosterjs-color-utils',
    'roosterjs-content-model-api',
    'roosterjs-content-model-core',
    'roosterjs-content-model-dom',
    'roosterjs-content-model-plugins',
    'roosterjs-content-model-types',
];

// 每个包内要删除的文件：包不参与 npm 解析（引用已全部相对路径化），构建配置由本项目统一提供
const deleteFiles = ['package.json', 'tsconfig.json', 'tsconfig.test.json'];

const packagesDir = __dirname;

/**
 * 包间引用从包名形式转为相对路径形式
 * 例如 from 'roosterjs-content-model-dom' => from '../../roosterjs-content-model-dom/lib/index'
 * 已是相对路径的引用不匹配正则，重复执行无副作用
 */
function replacePackageImports(dir) {
    const importRegex = /from '(roosterjs-content-model-(?:api|core|dom|plugins|types))'/g;

    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            replacePackageImports(fullPath);
        } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            // 当前文件所在目录到 packages 根目录的 ../ 层数
            const depth = path.relative(packagesDir, path.dirname(fullPath)).split(path.sep).length;
            const newContent = content.replace(importRegex, (_, pkgName) => {
                return `from '${'../'.repeat(depth)}${pkgName}/lib/index'`;
            });
            if (newContent !== content) {
                fs.writeFileSync(fullPath, newContent, 'utf-8');
            }
        }
    }
}

function main() {
    // 删除未保留的包与根目录下的 tsconfig
    for (const entry of fs.readdirSync(packagesDir, { withFileTypes: true })) {
        const fullPath = path.join(packagesDir, entry.name);
        if (entry.isDirectory() && !saveDirs.includes(entry.name)) {
            fs.rmSync(fullPath, { recursive: true, force: true });
        }
        if (entry.isFile() && deleteFiles.includes(entry.name)) {
            fs.rmSync(fullPath, { force: true });
        }
    }

    // 清理各保留包：删除 test 目录、包内 node_modules（源仓库 monorepo 的安装产物）与包内文件
    for (const name of saveDirs) {
        const packageDir = path.join(packagesDir, name);
        fs.rmSync(path.join(packageDir, 'test'), { recursive: true, force: true });
        fs.rmSync(path.join(packageDir, 'node_modules'), { recursive: true, force: true });
        for (const file of deleteFiles) {
            fs.rmSync(path.join(packageDir, file), { force: true });
        }
    }

    replacePackageImports(packagesDir);
}

main();
