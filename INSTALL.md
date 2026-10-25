# 🚀 快速安装与使用指南

## 一键启动（Windows）

双击运行 `start.bat`，脚本会自动完成：

1. 检查 Node.js 环境
2. 运行 `setup.js` 生成 `.vscode/tasks.json` 和 `keybindings.json`
3. 启动 `server.js` 本地服务（监听 `http://localhost:27122`）
4. 打印使用步骤

## 手动启动

```bash
# 1. 安装依赖（本项目无需 npm install，仅使用 Node.js 内置模块）

# 2. 生成 VSCode 配置
node setup.js

# 3. 启动本地服务
node server.js

# 4. 在 VSCode 中打开当前文件夹作为工作区
# 5. 浏览器安装 tampermonkey/ 下的两个用户脚本
# 6. 按 Alt+Enter 一键提交代码
```

## 浏览器脚本安装

将以下文件拖入浏览器的 Tampermonkey 扩展中安装：

- `tampermonkey/KedaOI-Hydro-Helper.user.js` —— 可达信奥 (Hydro) 抓题
- `tampermonkey/AtCoder-Plus-CPH.user.js` —— AtCoder 抓题

安装后，打开对应平台的题目页面，点击页面上的按钮即可同步题面到本地。

## 快捷键

| 按键 | 动作 | 说明 |
|------|------|------|
| `Alt+Enter` | 提交代码 | 将当前目录下最新的 `.cpp` 文件提交到 OJ |

## 目录结构

```
Hydro-AtCoder-GodMode/
├── start.bat          # Windows 一键启动脚本（双击即用）
├── start.js           # Node.js 跨平台启动脚本
├── setup.js           # VSCode 配置自动生成脚本
├── server.js          # 本地 HTTP 服务（端口 27122）
├── package.json       # 项目元数据
├── README.md          # 详细文档
├── LICENSE            # MIT 许可证
├── vscode-config/     # VSCode 任务与快捷键模板
│   ├── tasks.json
│   └── keybindings.json
└── tampermonkey/      # 浏览器用户脚本
    ├── KedaOI-Hydro-Helper.user.js
    └── AtCoder-Plus-CPH.user.js
```

## ⚠️ 注意事项

- 本工具仅供学习交流使用，请遵守各 OJ 平台的服务条款。
- 自动提交功能依赖浏览器 Cookie，请在浏览器中先登录对应 OJ 平台。
- 如需更换平台，需修改 `server.js` 中的 `/api/submit` 适配该平台的提交接口。