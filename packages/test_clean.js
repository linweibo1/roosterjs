/**
 * @desc: 删除不需要的所有文件和目录
 */

const fs = require('fs');
const path = require('path');

function deleteTestDirs(dir) {
    // 读取目录中的所有文件和子目录
    fs.readdir(dir, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error(`无法读取目录 ${dir}: ${err}`);
            return;
        }

        // 处理每个条目
        entries.forEach(entry => {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // 如果是目录，递归调用
                deleteTestDirs(fullPath);

                // 检查目录名是否为 "test"
                if (entry.name === 'test') {
                    // 删除名为 "test" 的目录
                    fs.rmdir(fullPath, { recursive: true }, err => {
                        if (err) {
                            console.error(`无法删除目录 ${fullPath}: ${err}`);
                        } else {
                            console.log(`已删除目录: ${fullPath}`);
                        }
                    });
                }
            }
        });
    });
}

function deleteRootDirsAndFiles(rootDir) {
    // 读取根目录中的所有文件和子目录
    fs.readdir(rootDir, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error(`无法读取目录 ${rootDir}: ${err}`);
            return;
        }

        // 处理每个条目
        entries.forEach(entry => {
            const fullPath = path.join(rootDir, entry.name);

            // 删除多余的目录
            if (entry.isDirectory() && !saveDirs.includes(entry.name)) {
                fs.rmdir(fullPath, { recursive: true }, err => {
                    if (err) {
                        console.error(`无法删除目录 ${fullPath}: ${err}`);
                    } else {
                        console.log(`已删除目录: ${fullPath}`);
                    }
                });
            }

            // 删除指定的文件
            if (entry.isFile() && deleteFiles.includes(entry.name)) {
                fs.unlink(fullPath, err => {
                    if (err) {
                        console.error(`无法删除文件 ${fullPath}: ${err}`);
                    } else {
                        console.log(`已删除文件: ${fullPath}`);
                    }
                });
            }
        });
    });
}

/**
 * 将本地包间引用（roosterjs-content-model-*）从包名形式转为相对路径形式
 * 例如：from 'roosterjs-content-model-dom' => from '../../roosterjs-content-model-dom/lib/index'
 * 深度根据文件相对于 packages 根目录的位置动态计算
 */
function replacePackageImports(packagesDir) {
    // 匹配 from 'roosterjs-content-model-xxx' 形式的 import（不匹配带子路径的）
    const importRegex = /from '(roosterjs-content-model-(?:api|core|dom|plugins|types))'/g;

    function processDir(dir) {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                processDir(fullPath);
            } else if (entry.isFile() && /\.tsx?$/.test(entry.name)) {
                const content = fs.readFileSync(fullPath, 'utf8');
                if (!importRegex.test(content)) {
                    continue;
                }
                // 重置 lastIndex
                importRegex.lastIndex = 0;

                // 计算当前文件到 packages 根目录的相对路径
                const relativeFromPackages = path.relative(packagesDir, fullPath);
                // 文件所在目录相对于 packages 的路径
                const fileDir = path.dirname(relativeFromPackages);
                // fileDir 形如 "roosterjs-content-model-api/lib/modelApi/block"
                // 需要回到 packages 根目录的 "../" 层数 = fileDir 中的目录层数
                const depth = fileDir.split(path.sep).length;
                const prefix = '../'.repeat(depth);

                const newContent = content.replace(importRegex, (match, pkgName) => {
                    return `from '${prefix}${pkgName}/lib/index'`;
                });

                if (newContent !== content) {
                    fs.writeFileSync(fullPath, newContent, 'utf8');
                    // console.log(`已替换包间引用: ${relativeFromPackages}`);
                }
            }
        }
    }

    processDir(packagesDir);
}

// 获取当前工作目录
const currentDir = process.cwd();

// 要删除的目录和文件
const saveDirs = [
    'roosterjs-content-model-api',
    'roosterjs-content-model-core',
    'roosterjs-content-model-dom',
    'roosterjs-content-model-plugins',
    'roosterjs-content-model-types',
    'roosterjs-editor-adapter',
];

const deleteFiles = ['tsconfig.test.json', 'tsconfig.json'];

// 先将本地包间引用转为相对路径（同步执行）
replacePackageImports(currentDir);

// 删除根目录下的指定目录和文件
deleteRootDirsAndFiles(currentDir);

// 删除名为 "test" 的目录
deleteTestDirs(currentDir);
