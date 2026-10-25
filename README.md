# Hydro-AtCoder-GodMode

[![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14-green.svg)](https://nodejs.org/)
[![VS Code](https://img.shields.io/badge/VSCode-ready-blue.svg)](https://code.visualstudio.com/)
[![Tampermonkey](https://img.shields.io/badge/tampermonkey-supported-orange.svg)](https://www.tampermonkey.net/)

> 极客级 OJ 刷题自动化工具，支持 **可达信奥 (Hydro)** 与 **AtCoder**。  
> 本地 VSCode 一键抓题、自动分屏看题、一键提交并回显结果。

## 🎯 项目特性

| 功能 | 说明 |
|------|------|
| **一键抓题** | 浏览器脚本抓取 Hydro / AtCoder 题面、样例、限制，同步到本地 `Problem.md` |
| **自动分屏** | 本地服务自动调用 VSCode 打开 `.cpp` 代码与题面 Markdown，并排查看 |
| **一键提交** | VSCode 按 `Alt+Enter` 自动读取最新 `.cpp` 并提交到 OJ |
| **状态轮询** | 提交后自动轮询评测结果，实时反馈通过/失败与得分 |
| **多平台支持** | 可达信奥 (KedaOI Hydro) 与 AtCoder 通用架构，易于扩展其他 OJ |

## 📁 项目结构

```
Hydro-AtCoder-GodMode/
├── start.bat                 # Windows 一键启动脚本（双击即用）
├── start.js                  # 跨平台 Node.js 启动脚本
├── setup.js                  # VSCode 配置自动生成脚本
├── server.js                 # 本地 HTTP 服务（监听 27122 端口）
├── package.json              # 项目元数据
├── LICENSE                   # MIT 许可证
├── INSTALL.md                # 快速安装与使用指南
├── README.md                 # 项目说明（本文件）
├── vscode-config/            # VSCode 任务与快捷键模板
│   ├── tasks.json            # g++ 编译 + 一键提交任务
│   └── keybindings.json      # Alt+Enter 一键提交快捷键
└── tampermonkey/             # 浏览器用户脚本
    ├── KedaOI-Hydro-Helper.user.js   # 可达信奥 (Hydro) 抓题脚本
    └── AtCoder-Plus-CPH.user.js      # AtCoder 抓题脚本
```

## 🚀 快速开始

### Windows 用户（推荐）

1. **下载或克隆仓库**
   ```bash
   git clone https://github.com/cnll0/Hydro-AtCoder-GodMode.git
   cd Hydro-AtCoder-GodMode
   ```

2. **双击运行 `start.bat`**  
   脚本会自动检查 Node.js、生成 VSCode 配置、启动本地服务。

3. **安装浏览器脚本**  
   将 `tampermonkey/` 下的两个 `.user.js` 文件拖入浏览器的 Tampermonkey 扩展中安装：
   - `KedaOI-Hydro-Helper.user.js` —— 可达信奥
   - `AtCoder-Plus-CPH.user.js` —— AtCoder

4. **打开 VSCode 工作区**  
   在 VSCode 中打开当前文件夹作为工作区。

5. **开始刷题**  
   - 浏览器打开题目页面，点击页面上的“发送到 CPH / VSCode”按钮
   - 服务自动打开 `.cpp` 代码与 `Problem.md` 题面
   - 编写/修改代码后，按 **`Alt+Enter`** 一键提交

### 其他平台（Mac / Linux）

```bash
# 1. 生成 VSCode 配置
node setup.js

# 2. 启动本地服务
node server.js

# 3. 按上述步骤 3~5 完成配置与使用
```

## ⌨️ 快捷键

| 按键 | 动作 |
|------|------|
| `Alt+Enter` | 提交当前目录下最新的 `.cpp` 文件到 OJ |

## 🔧 核心接口（`server.js`）

本地服务默认监听 `http://localhost:27122`，提供以下接口：

### `POST /api/sync`
接收浏览器脚本推送的题目信息：
- `cookie`：浏览器 Cookie（用于后续提交鉴权）
- `url`：当前题目页面 URL
- `markdown`：题面 Markdown 内容

服务会将题面写入本地 `Problem.md`，并自动打开 VSCode 显示代码与题面。

### `POST /api/submit`
自动提交代码：
1. 读取目录下最新修改的 `.cpp` 文件
2. 使用已保存的 Cookie 提交到对应 OJ
3. 轮询评测结果（最多 8 秒），返回状态与得分

## 📦 浏览器脚本说明

### KedaOI-Hydro-Helper.user.js
适用于 `kedaoi.cn` 及其子域名。功能包括：
- 抓取题目名称、时间/内存限制、样例输入输出
- 自动下载并解析额外 ZIP 样例包
- 将题面同步到本地 `http://localhost:27122/api/sync`

### AtCoder-Plus-CPH.user.js
适用于 `atcoder.jp/contests/*/tasks/*`。功能包括：
- 抓取 EN/JP 语言题面与样例
- 自动识别题目时限与内存限制
- 将题面同步到本地服务

## ⚠️ 注意事项

1. **仅供学习交流**：请遵守各 OJ 平台的服务条款与比赛规则，避免在正式比赛中使用自动提交功能。
2. **账号安全**：本工具使用浏览器 Cookie 进行提交鉴权，Cookie 仅在本地传输，不会上传到任何远程服务器。
3. **环境要求**：需安装 Node.js（≥14）和 VSCode，且 VSCode 需可通过 `code` 命令行启动。
4. **免责声明**：作者不对因使用本工具导致的账号封禁、成绩争议或其他后果负责。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！在提交 PR 前，请：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/your-feature`)
3. 提交更改 (`git commit -m 'Add some feature'`)
4. 推送到分支 (`git push origin feature/your-feature`)
5. 开启 Pull Request

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

---

**GitHub**：https://github.com/cnll0/Hydro-AtCoder-GodMode  
欢迎 Star、Fork 与提交 Issue！