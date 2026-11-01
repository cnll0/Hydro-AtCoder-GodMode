# 交接文档 · Hydro-AtCoder-GodMode

> 面向下一个接手的人（或下一个会话的 AI）。读完这份就能改代码、能排障。
> 上一轮交接对应提交 `3efc530`（v8.5）。本轮（题面按题落盘、提交前本地预检、`/api/preview`、端口占用提示）之后，仓库 `app.js` 是 103352 B / 875 行，提交号见 `git log -1`。

## 1. 它是什么

把「Hydro 题库（可达信奥 kedaoi.cn 或任意 Hydro 部署）浏览题目」→「抓题面+样例」→「本地写 .cpp」→「Alt+Enter 提交」→「回填判题结果」串成一条链的 Windows 小工具。

三个组件：

- **本地服务**（Node，`http://localhost:27122`）：接收浏览器发来的题面/样例/Cookie，管理「当前题目上下文」，代你 POST 到 OJ 并轮询判题结果。题面按题落盘到工作区 `Problems/<站点>/<标题>.md`（文件名只用题目标题、不带题号，标题里的非法字符直接删掉而不替换；不同题互不覆盖，同题重复抓取只覆盖自己），提交前先用本地 `g++ -fsyntax-only` 预检，预检不过直接判 CE、不发网络请求。
- **浏览器脚本**（篡改猴 userscript，`Hydro 通用全能助手` v8.5）：识别 Hydro 题页，右下角浮出「发送到 CPH」按钮，把题面转 Markdown、样例抓下来、连同 Cookie/语言发到本地服务。同时装 AtCoder 版脚本 `AtCoder-Plus-CPH.user.js`。
- **VS Code 任务/键位**：`Alt+Enter` = `submit code to OJ`，它是一条 `dependsOn` **复合任务**——先 `preview submit target`（`curl GET /api/preview`，`--max-time 3`，服务没起会立刻暴露），再 `submit code to OJ (post)`（`curl POST /api/submit`，`--max-time 60`）。另有 `start server`（`runOn: folderOpen`，开文件夹自动起服务）、`open problem`（`code -r` 打开题面）、`g++` 编译。

## 2. 两个目录（重要：不要搞反）

| 角色 | 路径 |
| --- | --- |
| **仓库/发布物**（git，推 GitHub） | `D:\Desktop\word_or_image\code\good_jb\Hydro-AtCoder-GodMode` |
| **源码/构建目录**（不进 git） | `D:\Desktop\word_or_image\code\good_jb\Hydro-AtCoder-GodMode-src` |

仓库 remote：`https://github.com/cnll0/Hydro-AtCoder-GodMode.git`（branch `main`，凭证由 `credential.helper=manager` 缓存，push 不用填 token）。

仓库里**只有 4 个文件**（刻意的，别再往仓库塞 README/截图/配置）：

```
app.js       103352 B  ← 由 Hydro-AtCoder-GodMode-src 构建生成，不要手改
install.bat   181 B    ← 安装器入口
start.bat     190 B    ← 启动服务入口
HANDOVER.md   这份交接文档（唯一允许的文档）
```

## 3. 三个入口 / 用法

| 做什么 | 命令 | 等价双击 |
| --- | --- | --- |
| 安装（弹系统选文件夹对话框选 .cpp 工作区，写 VS Code 配置，装运行时） | `node app.js` | `install.bat` |
| 启动本地服务（把 `app.js --serve` 跑在 27122） | `node app.js --serve` | `start.bat` |
| 卸载（清 `%LOCALAPPDATA%\HydroGodMode`） | `node app.js --uninstall` | — |

安装器可选参数（会跳过对应步骤，调试用）：`--no-keybind` `--no-browser` `--no-runtime`；也可直接传工作区目录作为第一个位置参数。

运行时目录：`%LOCALAPPDATA%\HydroGodMode`（内含 `app.js`、`settings.json`、`start.bat`、`uninstall.bat`）。工作区解析顺序（`app.js` 的 `workspaceDir()`）：`HYDRO_WORKSPACE` 环境变量 → `settings.json` 里的 `workspace`（需真实存在）→ 运行时目录兜底。

## 4. `app.js` 内部结构（单文件合并的代价/收益）

把 installation 逻辑、HTTP 服务、安装页 HTML、两个 userscript 全文、VS Code 配置模板全部内联进一个文件，**目的是「安装文件压到最少」**（用户明确要求）。代价：改脚本要看安装器源码；收益：整个项目 1 个 .js + 2 个 .bat。

大致行号（随改动漂移，用 `grep -n` 定位）：

| 行 | 内容 |
| --- | --- |
| 18 | `const ASSETS = { ... }` 静态资源表：`install.html`、`tampermonkey/Hydro-Helper.user.js`、`tampermonkey/AtCoder-Plus-CPH.user.js`、`hydro-console.js`、`tm-test.user.js` |
| 26 | `const VSCODE_FILES = { tasks.json, keybindings.json }` |
| 33/34 | `ENTRY_KEY='alt+enter'`、`ENTRY_TASK='submit code to OJ'` |
| 88 | `tasksJson(ws)`：默认任务表（g++ / preview submit target / submit code to OJ (post) / submit code to OJ / start server / open problem） |
| 136 | `mergeTasks(dst, wantJson)`：**已有 tasks.json 时按 label 差集补缺失任务**，用户改过的同名任务不动 |
| 153 | `setupWorkspace(ws)`：写 `.vscode/tasks.json`（已存在走 `mergeTasks`）、`keybindings.json`（已存在保留） |
| 289 | `installRuntime()`：复制 app.js/settings.json/start.bat/uninstall.bat 到 `%LOCALAPPDATA%\HydroGodMode` |
| 335 | `installerMain()` |
| 388 | `workspaceDir()` |
| 397 | `startServer()`（`MAX_POLLS = 25`，绑 `127.0.0.1`，`contexts = new Map()` 按 URL 存上下文，TTL 30 min；`server.on('error')` 处理端口占用） |
| 473 | `problemMarkdownPath(ctx)`：`Problems/<host>/<标题>.md`（标题直接删掉 Windows 非法字符 `/ \ : * ? " < > |` 与控制字符，不再替换成 `_`；空格、中文、标点原样保留，首尾点和空格去掉；取不到标题退回题号 `<pid>.md`；连题号都没有才用旧 `Problem.md`） |
| 489 | `openInVSCode(paths)`：`spawn` 逐参数传参（Windows 走 `cmd /c "code" "a.cpp" "b.md"`），不再把文件名拼进一条 shell 命令 |
| 526 | `localSyntaxCheck(file)`：`g++ -std=c++17 -fsyntax-only`，stderr 写临时文件（不建管道） |
| 588 | `/api/sync` 处理（`handleSync`；题面写入按各自 mdPath 做 400ms debounce + 内容去重，多标签不互相打断） |
| 667 | `/api/submit` 处理（`handleSubmit`，`redirect:'manual'` 取 Location 再解析 body 里的 rid；请求带 20s / 10s 超时） |
| 793 | `GET /api/preview`（`handlePreview`）：只回答「这次会提交哪个文件、什么语言」 |

## 5. 改代码的标准流程（⚠️ 别直接改仓库的 app.js）

```powershell
cd D:\Desktop\word_or_image\code\good_jb\Hydro-AtCoder-GodMode-src
# 1) 改源码：installer.js / server.js / install.html / tampermonkey\*.user.js / hydro-console.js / build.js
node build.js                 # 生成 Hydro-AtCoder-GodMode-src\app.js
node --check Hydro-AtCoder-GodMode-src\app.js    # 语法自检
powershell -NoProfile -ExecutionPolicy Bypass -File deploy.ps1
# deploy.ps1 会：复制 app.js 到仓库 → 重写 install.bat/start.bat(CRLF,UTF-8 无 BOM) → 清理旧文件 → node --check → 列目录
cd D:\Desktop\word_or_image\code\good_jb\Hydro-AtCoder-GodMode
git add -A; git commit -m "..."    # 提交信息用纯 ASCII
git push
git rev-parse HEAD; git rev-parse origin/main   # 必须一致
```

`build.js` 干的事（139 行）：读 `Hydro-AtCoder-GodMode-src` 下源码 → 切出 installer 主体（从注释 `// Hydro-AtCoder-GodMode 唯一安装器` 到 `main().catch(e =>`）→ 处理 `PICKER_PS` 常量 → 把 `setupWorkspace` 里的 `fs.copyFileSync(...)` 改写成 `fs.writeFileSync(dst, f === 'tasks.json' ? tasksJson(ws) : VSCODE_FILES[f], 'utf8')` → 切出 `server.js` 的服务主体、把 `WATCH_DIR = __dirname` 换成 `workspaceDir()`、用内嵌 `serveAsset` 替换静态文件服务（**不再改写 `exec('code -r' …)`**：server.js 已改用 `spawn` 逐参数传参，build.js 里那条替换已删掉）→ 生成 `ASSETS`/`VSCODE_FILES` 常量 → 加 tail（`workspaceDir`、`startServer`、`--serve` 分发）→ 写 `Hydro-AtCoder-GodMode-src/app.js`。

源码文件清单：`installer.js`(363) `server.js`(492) `install.html`(18884 B) `hydro-console.js`(2922 B) `tm-test.user.js`(963 B) `tampermonkey/Hydro-Helper.user.js`(531 行/24327 B) `tampermonkey/AtCoder-Plus-CPH.user.js`(4689 B) `vscode-config/{tasks,keybindings}.json` `build.js`(139) `deploy.ps1`。

## 6. HTTP API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| POST | `/api/sync` | 浏览器脚本上报：cookie、url、markdown（题面）、samples、lang/langlist、csrf。题面写入 `Problems/<站点>/<标题>.md`（无标题时退回 `<题号>.md`，完全无题号才用 `Problem.md`） |
| POST | `/api/submit` | 提交当前上下文到 OJ 并轮询判题（`MAX_POLLS=25`，约 25 秒）；返回中文状态，首行固定 `📄 文件: xxx.cpp（与题号匹配/最新修改） | lang: …`；`cc.*` 语言先跑本地语法预检 |
| GET | `/api/preview` | 返回 `{ok,url,title,pid,file,fileName,matchedByProblem,lang,mdPath}`；只看不提交，无上下文时 `ok:false`（仍 200） |
| POST | `/api/ping` | userscript 心跳（body: url/title/host/version） |
| GET | `/api/ping` | 返回 `{ok, now, ping}`，安装页 3 秒轮询一次显示「脚本到底跑没跑」 |
| GET | `/install.html` | 安装引导页（方式 A 一键安装 / 方式 B 复制粘贴 / 方式 C 控制台保底 / 心跳面板） |
| GET | `/tampermonkey/*.user.js` | 下发 userscript（`?download=1` 强制下载） |
| GET | `/hydro-console.js` | 控制台版加载器（不需要篡改猴） |

所有 API 路由用 `req.url.split('?')[0]` 匹配（带查询串不 404）；CORS 开 `*` + `GET,POST,HEAD,OPTIONS`；只绑 `127.0.0.1`。

服务端环境变量：

| 变量 | 作用 |
| --- | --- |
| `PORT` | 监听端口，默认 `27122` |
| `HYDRO_WORKSPACE` | 覆盖工作区（`.cpp` 扫描目录 + 题面落盘目录） |
| `HYDRO_CODE_CMD` | 打开文件用的命令，默认 `code`（测试时设 `echo`） |
| `HYDRO_COMPILER` | 指定本地编译器，默认依次试 `D:/msys2/ucrt64/bin/g++.exe`、`C:/msys64/ucrt64/bin/g++.exe`、`g++`、`clang++` |
| `HYDRO_NO_LOCAL_CHECK` | 设成任意值即关闭提交前的本地语法预检 |

## 7. 排障手册（真实踩过的坑）

### 7.1 「篡改猴里显示脚本已启用，但页面上什么都不出现」← 本次最大坑

**根因：篡改猴扩展的「用户脚本」总开关是关的**（MV3 的 `Allow user scripts`）。该开关关闭时，站点权限看起来完全正常、脚本也能装、面板显示「此脚本还未被执行」，但**一律不注入**，任何 `@match` 都救不回来。

排查顺序（按成本递增）：

1. 控制台看有没有 `[Hydro助手] 页面识别 {...}` 这行日志——**没有就说明函数体没执行，别再去调识别逻辑**（本次用户坚持「正则不匹配」，白绕了十几轮）。
2. 扩展详情页把「允许运行用户脚本 / Allow user scripts」打开，重新加载扩展，Ctrl+F5。
3. 篡改猴 4.x 在 MV3 下会静默不注入，升到 5.x。
4. 装 `tm-test.user.js`（3 行自检，安装页黄色提示块里有链接）：注入成功会 alert + 发心跳 `version:selftest`。

### 7.2 其它已知坑

- **端口占用**：`Get-NetTCPConnection -LocalPort 27122 -State Listen` 找 OwningProcess，`Stop-Process` 后重试。否则你看到的是旧进程，改的代码没生效。
- **`http://127.0.0.1:27122` 与 `http://localhost:27122` 可能命中不同的监听者/缓存**，出现莫名其妙的 "pong"。排查统一用 `localhost` 并加 `?t=时间戳`。
- **带中文的 `.ps1` 必须写 BOM**（`'\uFEFF' + 文本`），否则 PowerShell 5.1 按 GBK 读 UTF-8，中文标题变「璇烽€夋嫨…」。
- **`build.js` 的 `PICKER_PS` 不能二次 `JSON.stringify`**：`installer.js` 里它已经是 JSON 字符串字面量，再 stringify 会双重转义，生成的 `pick.ps1` 变成一行带字面 `\n` 的文本 → 12 个 ParserError。build.js 里已有判据 `psRaw.trim()[0] === '"' ? psRaw : JSON.stringify(psRaw)`。
- **`ASSETS` 是「字符串拼接数组」写法**：新增条目必须是 `"    'key': " + JSON.stringify(rd('file'))` 且上一行补 `+ ','`，否则生成的 app.js 语法错误。
- **`WATCH_DIR` 必须是 `workspaceDir()` 不能是 `__dirname`**：装到 `%LOCALAPPDATA%` 后 `__dirname` 扫不到用户的 .cpp。
- **`tasks.json` 的 `start server` 指向硬编码路径**（当初指向仓库 `app.js`）→ 更稳的写法是指向 `%LOCALAPPDATA%\HydroGodMode\app.js`。
- **PowerShell 里 `git commit -m` 带中文全角引号会被拆词**报 `pathspec ... did not match any file(s)` → 提交信息用纯 ASCII；`git push` 输出走 stderr，在 `$ErrorActionPreference='Stop'` 下会抛 NativeCommandError 但**推送已成功**，用 `git rev-parse` 比对确认。
- **run_code 的 TS 模板字符串里不能出现反引号**（PowerShell 的 `` `r`n `` 会直接语法报错），PS 里改用 `[char]10` 或数组 join。
- **`tools.edit` 要求目标文件本会话内被 `tools.read` 读过**，否则报 `file has not been read`。
- **受限环境里 `spawnSync` 不能建管道**（沙箱收紧时直接 `EPERM`）→ 探测编译器用 `stdio:'ignore'`，g++ 的报错写临时文件再 `fs.readFileSync` 读，别指望 `encoding:'utf8'` 的管道捕获。
- **老工作区拿不到新任务**：以前 `setupWorkspace` 见到 `tasks.json` 就跳过，现在按 label 合并；还不行就删掉 `.vscode/tasks.json` 重跑安装器。
- **`Problem.md` 只是旧版单文件兜底**：拿不到题号才写它；找题面去 `Problems/<host>/` 按标题看（无标题的用题号命名）。

## 8. 已完成的决策记录（为什么是现在这样）

- **选目录用系统原生对话框**：`installer.js` 内嵌 `PICKER_PS`（IFileOpenDialog 走 `FOS_PICKFOLDERS`）+ 回退 `FolderBrowserDialog`，用 1×1 隐形 TopMost Form 当 owner 防被控制台挡住。C# 接口签名必须用 `IShellItem` 而不是 `IntPtr`，否则报「重载方法具有一些无效参数」。
- **安装文件压到 3 个**（原 16 个）：删掉 setup.js / bind-keybinding.js / choose-dir.ps1 / runtime-start.bat / uninstall.bat / start.js / server.js / installer.js / install.html / README / INSTALL / LICENSE / package.json / tampermonkey / vscode-config，全部内联进 app.js。
- **userscript 通用化**：`@match *://*/*`（+ kedaoi 显式两条 + `@include *://*/*`），`ONLY_HOSTS` 留空=通用模式；按路径 `/p|/problem|/d/*/p/<id>` 强判 + 打分制兜底识别题页。
- **安装页「一键安装」回到相对链接**：曾做过 `?download=1` 强制下载，用户要求回退（m00549「不要,我之前还可以自动下载的」）。实测新旧版本响应头一致，弹不弹安装框取决于浏览器扩展状态，不是服务端。
- **加了控制台保底方案（方式 C）**：`hydro-console.js` 先给 `window.GM_xmlhttpRequest` 装 fetch 兼容层，再 `(0,eval)(src)` 执行 userscript 正文。实测 kedaoi 页面 CSP 不禁止 eval、https 页面 fetch `http://localhost` 未被混合内容拦截。唯一缺点：整页刷新后要重新粘贴。
- **扫描的 5 项增强**：`redirect:'manual'` 取 Location/解析 rid、`MAX_POLLS 8→25`、透传 `_csrf`、绑 `127.0.0.1` + CORS 收敛、`contexts Map` 按 URL 隔离（多标签不串台）。

## 9. 已知限制 / 待办

1. **老工作区的 tasks.json 只补「缺失的 label」**：用户改过的同名任务不会被更新；要强制刷新就删掉 `.vscode/tasks.json` 重跑安装器。
2. **本地语法预检要求本机有 g++**：找不到就静默跳过（日志一行提醒），此时 CE 只能等 OJ 判。
3. **tasks.json 里的 app.js 路径硬编码**，仓库换位置就失效（改成 `%LOCALAPPDATA%` 版更稳，未做）。
4. 篡改猴用户可以靠 `@updateURL`（指向 `localhost:27122`）自动更新脚本，但**服务没起时不会更新**；也可以从安装页手动重装。
5. 控制台方式每次刷新要重新粘贴（可用书签小工具缓解，未做）。
6. 只做了 Windows（依赖 `powershell.exe`、`%LOCALAPPDATA%`、`.bat`）。
7. `Problems/` 只增不清理：每题一个 `<标题>.md`，同题只覆盖自己，不会自动删旧题；**同站两题同名会撞名**（后写的覆盖前一份），需要区分时手动改名即可。

## 10. 常用命令速查

```powershell
# 编译/部署/推送
cd D:\Desktop\word_or_image\code\good_jb\Hydro-AtCoder-GodMode-src; node build.js; powershell -NoProfile -ExecutionPolicy Bypass -File deploy.ps1
cd D:\Desktop\word_or_image\code\good_bj   # ← 正确路径见上，注意 good_jb

# 起服务（后台，日志重定向）
Start-Process node 'D:\Desktop\word_or_image\code\good_jb\Hydro-AtCoder-GodMode\app.js' --serve
# 验证
Invoke-WebRequest http://localhost:27122/install.html -UseBasicParsing | % RawContentLength
Invoke-WebRequest http://localhost:27122/api/ping -UseBasicParsing | % Content

# 找端口占用
Get-NetTCPConnection -LocalPort 27122 -State Listen | % OwningProcess | % { Stop-Process -Id $_ -Force }
```

## 11. 给接手 AI 的三句话

1. **改代码只改 `Hydro-AtCoder-GodMode-src`，然后 `build.js` + `deploy.ps1` + 提交推送**；仓库的 `app.js` 是产物。
2. **页面没反应先看控制台有没有 `[Hydro助手] 页面识别`**：没有 = userscript 没注入（先查篡改猴「允许运行用户脚本」开关），有 = 才轮到识别逻辑。
3. 提交信息用 ASCII，push 后一定 `git rev-parse HEAD` 与 `origin/main` 对齐确认。
