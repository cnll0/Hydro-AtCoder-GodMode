const fs = require('fs');
const path = require('path');

const vscodeDir = path.join(__dirname, '.vscode');
if (!fs.existsSync(vscodeDir)) fs.mkdirSync(vscodeDir);

fs.copyFileSync(path.join(__dirname, 'vscode-config/tasks.json'), path.join(vscodeDir, 'tasks.json'));
fs.copyFileSync(path.join(__dirname, 'vscode-config/keybindings.json'), path.join(vscodeDir, 'keybindings.json'));

console.log('\n=============================================');
console.log('✅ 一键安装成功！VSCode 配置已部署到当前目录。');
console.log('👉 下一步：');
console.log('1. 运行 `node server.js` 启动本地服务。');
console.log('2. 把 `tampermonkey/` 里的两个脚本安装到浏览器。');
console.log('3. 在 VSCode 中把当前文件夹作为工作区打开。');
console.log('4. 写代码，按 Alt+Enter 一键提卷！');
console.log('=============================================\n');