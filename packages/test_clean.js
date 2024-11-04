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
          fs.rmdir(fullPath, { recursive: true }, (err) => {
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

      // 删除指定的目录
      if (entry.isDirectory() && deleteDirs.includes(entry.name)) {
        fs.rmdir(fullPath, { recursive: true }, (err) => {
          if (err) {
            console.error(`无法删除目录 ${fullPath}: ${err}`);
          } else {
            console.log(`已删除目录: ${fullPath}`);
          }
        });
      }

      // 删除指定的文件
      if (entry.isFile() && deleteFiles.includes(entry.name)) {
        fs.unlink(fullPath, (err) => {
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

// 获取当前工作目录
const currentDir = process.cwd();

// 要删除的目录和文件
const deleteDirs = [
  'roosterjs',
  'roosterjs-color-utils',
  'roosterjs-react',
];

const deleteFiles = [
  'tsconfig.test.json',
];

// 先删除根目录下的指定目录和文件
deleteRootDirsAndFiles(currentDir);

// 然后删除名为 "test" 的目录
deleteTestDirs(currentDir);
