const fs = require('fs');
const os = require('os');
const path = require('path');

// 用法: node bind-keybinding.js [keybindings.json 路径]
// 作用: 把 Alt+Enter -> "submit code to OJ" 合并进 VS Code 用户快捷键配置。
// 说明: VS Code 不读取工作区 .vscode/keybindings.json，必须写用户级配置。

const ENTRY_KEY = 'alt+enter';
const ENTRY_TASK = 'submit code to OJ';

function candidatePaths() {
    const home = os.homedir();
    if (process.platform === 'win32') {
        const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
        return [
            ['Code', path.join(appData, 'Code', 'User', 'keybindings.json')],
            ['Code - Insiders', path.join(appData, 'Code - Insiders', 'User', 'keybindings.json')],
            ['Cursor', path.join(appData, 'Cursor', 'User', 'keybindings.json')],
            ['VSCodium', path.join(appData, 'VSCodium', 'User', 'keybindings.json')]
        ];
    }
    if (process.platform === 'darwin') {
        const base = path.join(home, 'Library', 'Application Support');
        return [
            ['Code', path.join(base, 'Code', 'User', 'keybindings.json')],
            ['Code - Insiders', path.join(base, 'Code - Insiders', 'User', 'keybindings.json')],
            ['Cursor', path.join(base, 'Cursor', 'User', 'keybindings.json')]
        ];
    }
    const base = path.join(home, '.config');
    return [
        ['Code', path.join(base, 'Code', 'User', 'keybindings.json')],
        ['Code - Insiders', path.join(base, 'Code - Insiders', 'User', 'keybindings.json')],
        ['Cursor', path.join(base, 'Cursor', 'User', 'keybindings.json')]
    ];
}

function pickTarget(explicit) {
    if (explicit) return { name: 'custom', file: path.resolve(explicit) };
    const list = candidatePaths();
    // 优先已有 keybindings.json 的编辑器；否则选 Code 的用户目录（不存在则创建）
    for (const [name, file] of list) {
        if (fs.existsSync(file)) return { name, file };
    }
    for (const [name, file] of list) {
        const userDir = path.dirname(file);
        if (fs.existsSync(userDir)) return { name, file };
    }
    return { name: list[0][0], file: list[0][1] };
}

function stripJsonc(text) {
    // 去注释（字符串内的 // 不处理会误伤 URL；这里做保守处理：只去行首注释和块注释）
    let out = text.replace(/\/\*[\s\S]*?\*\//g, '');
    out = out.replace(/^\s*\/\/.*$/gm, '');
    // 去尾逗号
    out = out.replace(/,\s*([}\]])/g, '$1');
    return out;
}

function alreadyBound(text) {
    const lower = text.toLowerCase();
    return lower.includes(ENTRY_KEY) && text.includes(ENTRY_TASK);
}

function insertEntry(text) {
    const entry =
        '    {\n' +
        '        "key": "alt+enter",\n' +
        '        "command": "workbench.action.tasks.runTask",\n' +
        '        "args": "submit code to OJ"\n' +
        '    }';

    const trimmed = text.trim();
    if (!trimmed) {
        return '[\n' + entry + '\n]\n';
    }

    const closeIdx = text.lastIndexOf(']');
    if (closeIdx === -1) {
        throw new Error('keybindings.json 里找不到结尾的 ]，已跳过，请手动添加');
    }

    const before = text.slice(0, closeIdx);
    const after = text.slice(closeIdx);
    let beforeTrim = before.replace(/\s+$/, '');
    // 去掉原有尾逗号，避免生成 }, , 双逗号
    beforeTrim = beforeTrim.replace(/,+$/, '');
    const isEmptyArray = /\[\s*$/.test(beforeTrim);
    return beforeTrim + (isEmptyArray ? '\n' : ',\n') + entry + '\n' + after;
}

function main() {
    const { name, file } = pickTarget(process.argv[2]);
    const userDir = path.dirname(file);

    if (!fs.existsSync(userDir)) fs.mkdirSync(userDir, { recursive: true });

    let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (text.trim() && alreadyBound(text)) {
        console.log(`[keybinding] ${name}: 已存在 Alt+Enter 绑定，跳过 (${file})`);
        return;
    }

    // 校验现有内容能解析（JSONC 宽松处理），解析失败就不动，避免弄坏用户配置
    if (text.trim()) {
        try {
            JSON.parse(stripJsonc(text));
        } catch (e) {
            console.error(`[keybinding] 现有配置无法解析，已跳过：${e.message}`);
            console.error('[keybinding] 请手动在 VS Code 快捷键设置里绑定 Alt+Enter -> submit code to OJ');
            return;
        }
        const backup = file + '.hydro.bak';
        fs.copyFileSync(file, backup);
        console.log(`[keybinding] 已备份原配置：${backup}`);
    }

    const next = insertEntry(text);
    fs.writeFileSync(file, next, 'utf8');
    console.log(`[keybinding] ${name}: 已写入 Alt+Enter -> "${ENTRY_TASK}"`);
    console.log(`[keybinding] 文件：${file}`);
    console.log('[keybinding] 若 VS Code 正在运行，请执行 “Developer: Reload Window” 或重启后生效。');
}

try {
    main();
} catch (e) {
    console.error('[keybinding] 失败：' + e.message);
    process.exitCode = 1;
}
