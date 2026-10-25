const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname);

function log(msg) {
    console.log(`[start] ${msg}`);
}

function err(msg) {
    console.error(`[start][错误] ${msg}`);
}

// 1. 检查 Node.js
try {
    execSync('node --version', { stdio: 'pipe' });
} catch (e) {
    err('未检测到 Node.js，请先安装：https://nodejs.org/');
    process.exit(1);
}

log('Node.js 环境已就绪');

// 2. 进入项目目录
process.chdir(ROOT);

// 3. 运行 setup.js 生成 .vscode 配置
log('正在运行 setup.js 生成 VSCode 配置...');
try {
    execSync('node setup.js', { stdio: 'inherit' });
} catch (e) {
    err('setup.js 运行失败');
    process.exit(1);
}
log('VSCode 配置已就绪');

// 4. 启动 server.js
log('正在启动本地服务 (http://localhost:27122)...');
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: ROOT,
    shell: true
});

server.on('exit', (code) => {
    if (code !== 0 && code !== null) {
        err(`服务进程退出，代码：${code}`);
        process.exit(code);
    }
});

process.on('SIGINT', () => {
    server.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    server.kill('SIGTERM');
    process.exit(0);
});