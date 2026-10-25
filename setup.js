const fs = require('fs');
const path = require('path');

// 用法: node setup.js [目标目录]
// 目标目录默认是脚本所在目录；支持指定你的代码工作区，把 .vscode 配到那里。
const targetDir = path.resolve(process.argv[2] || __dirname);
if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

const vscodeDir = path.join(targetDir, '.vscode');
if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir, { recursive: true });

fs.copyFileSync(path.join(__dirname, 'vscode-config/tasks.json'), path.join(vscodeDir, 'tasks.json'));
fs.copyFileSync(path.join(__dirname, 'vscode-config/keybindings.json'), path.join(vscodeDir, 'keybindings.json'));

console.log('\n=============================================');
console.log('✅ VSCode 配置已部署到: ' + vscodeDir);
console.log('👉 下一步：');
console.log('1. 运行 `node server.js` 启动本地服务。');
console.log('2. 打开 http://localhost:27122/install.html 安装抓题脚本。');
console.log('3. 在 VSCode 中把该目录作为工作区打开。');
console.log('4. 写代码，按 Alt+Enter 一键提交。');
console.log('=============================================\n');
