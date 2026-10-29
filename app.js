#!/usr/bin/env node
'use strict';

// Hydro-AtCoder-GodMode 单文件版（安装器 + 本地服务）
//   node app.js               安装：选目录 / 写 .vscode / 绑快捷键 / 装常驻服务
//   node app.js --serve       启动本地服务（start.bat 调用的就是它）
//   node app.js --uninstall   卸载常驻服务
// 安装页、两个篡改猴脚本、VS Code 配置全部内嵌在本文件，仓库不需要其它脚本。

const fs = require('fs');
const os = require('os');
const path = require('path');
const net = require('net');
const http = require('http');
const readline = require('readline');
const { exec, spawn, spawnSync } = require('child_process');

const ASSETS = {
    'install.html': "<!DOCTYPE html>\n<html lang=\"zh-CN\">\n<head>\n<meta charset=\"UTF-8\">\n<title>Hydro-AtCoder-GodMode 一键安装引导</title>\n<style>\n  * { box-sizing: border-box; }\n  body {\n    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n    max-width: 760px; margin: 40px auto; padding: 0 20px;\n    background: #f5f7fa; color: #1f2937; line-height: 1.6;\n  }\n  h1 { font-size: 24px; margin-bottom: 8px; color: #111827; }\n  .subtitle { color: #6b7280; margin-bottom: 32px; font-size: 16px; }\n  .card {\n    background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px;\n    padding: 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);\n  }\n  .step { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 16px; }\n  .step:last-child { margin-bottom: 0; }\n  .num {\n    flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%;\n    background: #2563eb; color: #fff; display: flex; align-items: center;\n    justify-content: center; font-weight: bold; font-size: 16px;\n  }\n  .step h3 { margin: 0 0 6px 0; font-size: 18px; color: #111827; }\n  .step p { margin: 0; font-size: 14px; color: #4b5563; }\n  .btn-row { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }\n  button {\n    padding: 10px 18px; border: none; border-radius: 8px; font-size: 14px;\n    font-weight: 600; cursor: pointer; transition: all 0.15s;\n  }\n  button:active { transform: translateY(1px); }\n  .btn-primary { background: #2563eb; color: #fff; border: none; }\n  .btn-primary:hover { background: #1d4ed8; }\n  .btn-success { background: #059669; color: #fff; border: none; }\n  .btn-success:hover { background: #047857; }\n  .btn-secondary { background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; }\n  .btn-secondary:hover { background: #e5e7eb; }\n  .btn-link { background: transparent; color: #2563eb; text-decoration: underline; padding: 8px 14px; border: none; }\n  .btn-link:hover { background: #eff6ff; }\n  code {\n    background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px;\n    color: #b91c1c; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;\n  }\n  .alert {\n    background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px;\n    padding: 12px 16px; margin-top: 16px; color: #92400e; font-size: 14px;\n  }\n  .alert b { color: #854d0e; }\n  .mono { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 13px; }\n  .footer { color: #6b7280; font-size: 13px; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px; }\n  .warn {\n    background: #fee2e2; border: 1px solid #fca5a5; border-radius: 8px;\n    padding: 12px 16px; margin-top: 16px; color: #991b1b; font-size: 14px;\n  }\n  .manual-steps { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-top: 16px; }\n  .manual-steps h4 { margin-top: 0; color: #111827; font-size: 16px; }\n  .manual-steps ol { margin: 8px 0 0 0; padding-left: 24px; color: #4b5563; }\n  .manual-steps li { margin-bottom: 8px; }\n  .script-box {\n    background: #1f2937; color: #e5e7eb; border-radius: 8px;\n    padding: 16px; font-family: ui-monospace, SFMono-Regular, Consolas, monospace;\n    font-size: 13px; max-height: 320px; overflow: auto; margin-top: 12px;\n    border: 1px solid #374151;\n  }\n  .copy-hint { color: #6b7280; font-size: 12px; margin-top: 6px; }\n  .script-preview { margin-top: 16px; display: none; }\n  .script-preview h4 { margin: 0 0 8px 0; color: #111827; font-size: 16px; }\n</style>\n</head>\n<body>\n\n<h1>🚀 Hydro-AtCoder-GodMode 一键安装引导</h1>\n<p class=\"subtitle\">无需科学上网，直接在本地完成 Tampermonkey 扩展与抓题脚本安装</p>\n\n<div class=\"warn\">\n  <b>⚠️ 浏览器安全限制：</b> 篡改猴无法从 <code>file://</code> 本地文件直接安装脚本（双击 HTML 打开只会看到源码或空白页）。<br>\n  <b>正确姿势：</b> 先双击 <code>start.bat</code> 启动本地服务，再把浏览器地址栏改成\n  <a href=\"http://localhost:27122/install.html\">http://localhost:27122/install.html</a>。这样点击脚本链接会直接唤起篡改猴安装框。\n</div>\n\n<div class=\"card\" style=\"border-color:#86efac;background:#f0fdf4;\">\n  <h3 style=\"margin-top:0;color:#166534;\">✅ 推荐流程（一次配置，以后免装）</h3>\n  <ol style=\"padding-left:20px;color:#166534;margin-bottom:0;\">\n    <li>双击 <code>start.bat</code> 启动本地服务（窗口别关）。</li>\n    <li>浏览器打开 <a href=\"http://localhost:27122/install.html\">http://localhost:27122/install.html</a>。</li>\n    <li>先点「篡改猴」按钮装扩展；再点两个脚本链接，篡改猴弹出安装框 → 点「安装」。</li>\n    <li>回到任意 Hydro 站点 / AtCoder 题目页，刷新后即可看到抓题按钮。</li>\n  </ol>\n</div>\n\n<div class=\"card\">\n  <div class=\"step\">\n    <div class=\"num\">1</div>\n    <div>\n      <h3>安装 Tampermonkey 扩展（浏览器插件本体）</h3>\n      <p>如果你已经安装了 Tampermonkey，可跳过此步。</p>\n      <p><b>可直达的安装渠道（无需科学上网）：</b></p>\n      <div class=\"btn-row\">\n        <button class=\"btn-primary\" onclick=\"location.href='https://microsoftedge.microsoft.com/addons/detail/%E7%AF%A1%E6%94%B9%E7%8C%B4/iikmkjmpaadaobahmlepeloendndfphd'\">Edge 商店直接安装篡改猴（推荐）</button>\n        <button class=\"btn-secondary\" onclick=\"location.href='https://www.tampermonkey.net/'\">Tampermonkey 官网</button>\n        <button class=\"btn-link\" onclick=\"location.href='https://addons.mozilla.org/firefox/addon/tampermonkey/'\">Firefox 附加组件</button>\n      </div>\n      <div class=\"alert\"><b>注意：</b> 安装后会弹出浏览器确认窗口，请点击“添加到 Edge/Chrome”或“添加扩展程序”。</div>\n    </div>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"num\">2</div>\n    <div>\n      <h3>安装抓题脚本（Tampermonkey 用户脚本）</h3>\n      <p>Tampermonkey 安装完成后，选择以下任一方式添加脚本：</p>\n\n      <div class=\"manual-steps\" style=\"margin-top:16px;border-color:#86efac;background:#f0fdf4;\">\n        <h4 style=\"color:#166534;\">方式 A（推荐）：通过本地服务一键安装</h4>\n        <div style=\"margin:10px 0;padding:10px 12px;border-left:4px solid #f59e0b;background:#fffbeb;color:#92400e;font-size:13px;line-height:1.6;\">\n          <b>如果点下面两个链接后得到的是一整页脚本代码、篡改猴没有弹安装框</b>，说明当前这个浏览器里篡改猴没启用（或你在 Edge 装的、却用 Chrome 打开了本页）。<br>\n          先在地址栏打开 <code>edge://extensions</code>（Chrome 是 <code>chrome://extensions</code>）确认「篡改猴 / Tampermonkey」是<b>已启用</b>状态，再点它的<b>「详情」</b>把 <b>“允许运行用户脚本 / Allow user scripts”</b> 开关打开（新版 Chrome/Edge 是 MV3，这个开关关着时站点权限完全正常、但脚本一律不注入），最后回到本页按 Ctrl+F5 后重试；\n          或者直接用下面的「下载文件 → 拖进浏览器窗口」方式，效果一样。<br><b>10 秒定位用：</b><a href=\"tm-test.user.js\">装这个 3 行自检脚本</a>（它只弹一个 alert + 打个心跳）——它跑不跑，就能一句话分清是「篡改猴根本没注入」还是「主脚本的问题」。\n        </div>\n        <p style=\"color:#166534;\">确认地址栏是 <code>http://localhost:端口/install.html</code>（不是 file://），然后直接点下面两个链接，篡改猴会弹出安装框：</p>\n        <div class=\"btn-row\">\n          <a class=\"btn-success\" style=\"text-decoration:none;display:inline-block;\" href=\"tampermonkey/Hydro-Helper.user.js\">🚀 一键安装 Hydro 脚本</a>\n          <a class=\"btn-success\" style=\"text-decoration:none;display:inline-block;\" href=\"tampermonkey/AtCoder-Plus-CPH.user.js\">🚀 一键安装 AtCoder 脚本</a>\n        </div>\n        <p style=\"color:#166534;margin-top:10px;font-size:13px;\">点了没反应？那是浏览器/扩展没接住本地地址，改用文件方式：<a href=\"tampermonkey/Hydro-Helper.user.js?download=1\" download=\"Hydro-Helper.user.js\">下载 Hydro 文件</a> · <a href=\"tampermonkey/AtCoder-Plus-CPH.user.js?download=1\" download=\"AtCoder-Plus-CPH.user.js\">下载 AtCoder 文件</a>，再拖进浏览器窗口。</p>\n      </div>\n      <div id=\"hb\" style=\"margin-top:12px;padding:10px 12px;border-radius:8px;border:1px solid #cbd5e1;background:#f1f5f9;color:#334155;font-size:13px;line-height:1.7;\">\n        🔄 正在检查抓题脚本心跳……\n      </div>\n      <div class=\"manual-steps\" style=\"margin-top:16px;\">\n        <h4>方式 B：复制源码 → 手动粘贴（任何情况下都可用）</h4>\n        <ol>\n          <li>点击下面的 <b>📋 复制脚本内容</b> 按钮，脚本代码会自动复制到剪贴板。</li>\n          <li>打开浏览器 Tampermonkey 扩展页面，点击“添加新脚本”。</li>\n          <li>删除编辑器里的默认代码，把复制的内容全部粘贴进去。</li>\n          <li>按 <code>Ctrl+S</code> 保存脚本。</li>\n        </ol>\n      </div>\n\n      <div class=\"manual-steps\" style=\"margin-top:16px;border-left:4px solid #6366f1;\">\n        <h4>方式 C（保底，完全不需要篡改猴）：控制台粘贴一行</h4>\n        <p style=\"font-size:13px;color:#475569;line-height:1.8;\">\n          篡改猴一直显示「此脚本还未被执行」时用这个——最省事，也能直接证明本地服务是通的：<br>\n          1. 打开题目页 → 按 <code>F12</code> → 切到「控制台 / Console」；<br>\n          2. 粘贴下面这一行 → 回车；<br>\n          3. 本页立刻出现「发送到 CPH」按钮，上面的心跳框会在 3 秒内变绿。<br>\n          前提：本地服务（<code>start.bat</code>）正在运行。<b>整页刷新（F5）后需要重新粘贴一次</b>，同一标签页内的站内跳转不用。\n        </p>\n        <pre id=\"console-snippet\" class=\"script-box\" style=\"white-space:pre-wrap;word-break:break-all;user-select:all;cursor:text;font-size:12px;\">fetch('http://localhost:27122/hydro-console.js',{cache:'no-store'}).then(r=>r.text()).then(t=>(0,eval)(t))</pre>\n        <button class=\"btn-secondary\" onclick=\"copySnippet()\">📋 复制这一行</button>\n        <p style=\"font-size:12px;color:#64748b;margin-top:6px;\">若控制台提示「不允许粘贴 / Don&#39;t paste code」，先手动输入 <code>allow pasting</code> 回车，再粘贴。</p>\n      </div>\n\n      <div class=\"btn-row\" style=\"margin-top: 14px;\">\n        <button class=\"btn-secondary\" onclick=\"copyToClipboard('hydro')\">📋 复制 Hydro 脚本内容</button>\n        <button class=\"btn-secondary\" onclick=\"copyToClipboard('atcoder')\">📋 复制 AtCoder 脚本内容</button>\n        <button class=\"btn-secondary\" onclick=\"installViaDataURI('hydro')\">备用：data URI 打开 Hydro</button>\n        <button class=\"btn-secondary\" onclick=\"installViaDataURI('atcoder')\">备用：data URI 打开 AtCoder</button>\n      </div>\n\n      <div id=\"script-preview-hydro\" class=\"script-preview\">\n        <h4>📄 Hydro 通用助手脚本源码</h4>\n        <pre class=\"script-box\" id=\"content-hydro\"></pre>\n        <div class=\"copy-hint\">全选复制（Ctrl+A → Ctrl+C）后粘贴到 Tampermonkey 新建脚本中</div>\n      </div>\n\n      <div id=\"script-preview-atcoder\" class=\"script-preview\">\n        <h4>📄 AtCoder 脚本源码</h4>\n        <pre class=\"script-box\" id=\"content-atcoder\"></pre>\n        <div class=\"copy-hint\">全选复制（Ctrl+A → Ctrl+C）后粘贴到 Tampermonkey 新建脚本中</div>\n      </div>\n    </div>\n  </div>\n\n  <div class=\"step\">\n    <div class=\"num\">3</div>\n    <div>\n      <h3>启动本地服务</h3>\n      <p>双击 <code>start.bat</code>，或执行 <code>node app.js --serve</code>，启动本地 HTTP 服务（<code>http://localhost:27122</code>）。</p>\n      <p style=\"color:#4b5563;line-height:1.9;\">安装器参数：<code>node app.js</code> 重新安装 · <code>node app.js --uninstall</code> 卸载 · <code>--no-keybind</code> 跳过快捷键 · <code>--no-runtime</code> 不装常驻服务。<br>\n      装好的常驻服务在 <code>%LOCALAPPDATA%\\HydroGodMode</code>，里面有 <code>start.bat</code>（启动）和 <code>uninstall.bat</code>（卸载）。<br>\n      常用快捷键：<code>Alt+Enter</code> 提交当前题目的代码。</p>\n    </div>\n  </div>\n</div>\n\n<div class=\"card\">\n  <h3 style=\"margin-top:0;\">🔍 验证安装是否成功</h3>\n  <ol style=\"padding-left: 20px; color: #4b5563;\">\n    <li>浏览器工具栏右上角应出现 Tampermonkey 图标。</li>\n    <li>点击 Tampermonkey 图标，应能看到 <span class=\"mono\">Hydro-Helper</span> 和 <span class=\"mono\">AtCoder-Plus-CPH</span> 两个已启用的脚本。</li>\n    <li>打开任意 <a href=\"https://github.com/hydro-dev/Hydro\" target=\"_blank\" rel=\"noopener\">Hydro</a> 站点（例如 <a href=\"https://kedaoi.cn/\" target=\"_blank\" rel=\"noopener\">可达信奥</a>）或 <a href=\"https://atcoder.jp/\" target=\"_blank\" rel=\"noopener\">AtCoder</a> 题目页面，页面应出现“发送到 CPH / VSCode”按钮。</li>\n  </ol>\n</div>\n\n<div class=\"footer\">\n  Hydro-AtCoder-GodMode · 极客级 OJ 刷题自动化工具<br>\n  GitHub: <a href=\"https://github.com/cnll0/Hydro-AtCoder-GodMode\" target=\"_blank\" rel=\"noopener\" style=\"color:#2563eb;\">cnll0/Hydro-AtCoder-GodMode</a>\n</div>\n\n<!-- 脚本内容内嵌（不被浏览器执行，仅供 JS 读取）-->\n<script id=\"script-hydro\" type=\"text/plain\" data-src=\"tampermonkey/Hydro-Helper.user.js\"></script>\n\n<script id=\"script-atcoder\" type=\"text/plain\" data-src=\"tampermonkey/AtCoder-Plus-CPH.user.js\"></script>\n\n<script>\n// 获取内嵌脚本内容\n// 源码不再写死在页面里（避免两份不同步），从仓库文件现取\nconst SOURCE_FILES = {\n  hydro: 'tampermonkey/Hydro-Helper.user.js',\n  atcoder: 'tampermonkey/AtCoder-Plus-CPH.user.js'\n};\nconst sourceCache = {};\nasync function getScriptContent(kind) {\n  if (sourceCache[kind]) return sourceCache[kind];\n  const file = SOURCE_FILES[kind];\n  try {\n    const res = await fetch(file, { cache: 'no-cache' });\n    if (!res.ok) throw new Error('HTTP ' + res.status);\n    sourceCache[kind] = await res.text();\n    return sourceCache[kind];\n  } catch (e) {\n    throw new Error('读取 ' + file + ' 失败（' + e.message + '）。请确认地址栏是 http://localhost:端口/install.html 而不是 file://，并且服务仍在运行。');\n  }\n}\n\n// 复制到剪贴板（不依赖 fetch，直接读取内嵌内容）\nasync function copyToClipboard(kind) {\n  let text;\n  try { text = await getScriptContent(kind); } catch (e) { alert('⚠️ ' + e.message); return; }\n  const name = kind === 'hydro' ? 'Hydro 通用助手' : 'AtCoder';\n  try {\n    await navigator.clipboard.writeText(text);\n    alert('✅ ' + name + ' 脚本内容已复制到剪贴板！\\n\\n接下来：打开 Tampermonkey → 添加新脚本 → 删除默认代码 → 粘贴 → Ctrl+S 保存');\n  } catch (e) {\n    // 兜底：显示在预览区，让用户手动复制\n    const previewId = 'script-preview-' + kind;\n    const contentId = 'content-' + kind;\n    const preview = document.getElementById(previewId);\n    const content = document.getElementById(contentId);\n    content.textContent = text;\n    preview.style.display = 'block';\n    preview.scrollIntoView({ behavior: 'smooth' });\n    alert('⚠️ 无法自动复制到剪贴板，请手动全选上面的代码（Ctrl+A → Ctrl+C），然后粘贴到 Tampermonkey 中。');\n  }\n}\n\n// 通过 data URI 尝试让 Tampermonkey 拦截并安装\nasync function installViaDataURI(kind) {\n  const text = await getScriptContent(kind);\n  const name = kind === 'hydro' ? 'Hydro-Helper.user.js' : 'AtCoder-Plus-CPH.user.js';\n  // 构造 data URI，MIME 类型为 application/javascript，Tampermonkey 会识别 UserScript 块\n  const encoded = encodeURIComponent(text);\n  const dataUri = 'data:application/javascript;charset=UTF-8,' + encoded;\n  // 在新标签页打开，Tampermonkey 扩展会拦截并弹出安装确认框\n  const win = window.open(dataUri, '_blank');\n  if (!win) {\n    alert('⚠️ 浏览器阻止了弹出窗口，请允许本站弹出窗口后重试，或使用“复制脚本内容”按钮手动安装。');\n  }\n}\n</script>\n// 复制「方式 C」的控制台一行代码\nasync function copySnippet() {\n  const el = document.getElementById('console-snippet');\n  const text = el.textContent.trim();\n  try {\n    await navigator.clipboard.writeText(text);\n    alert('✅ 已复制。去题目页按 F12 → 控制台 → 粘贴 → 回车');\n  } catch (e) {\n    const range = document.createRange();\n    range.selectNodeContents(el);\n    const sel = window.getSelection();\n    sel.removeAllRanges();\n    sel.addRange(range);\n    alert('⚠️ 无法自动复制，已帮你选中这行代码，按 Ctrl+C 复制');\n  }\n}\n\n  <script>\n    /* 心跳面板：抓题脚本一旦在任意网页跑起来就会 POST /api/ping，这里能看出它到底有没有运行 */\n    (function () {\n      var box = document.getElementById('hb');\n      if (!box) return;\n      function pad(n) { return n < 10 ? '0' + n : '' + n; }\n      function hhmmss(ms) { var d = new Date(ms); return pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }\n      function tick() {\n        fetch('/api/ping?t=' + Date.now(), { cache: 'no-store' })\n          .then(function (r) { return r.json(); })\n          .then(function (j) {\n            var p = j.ping;\n            if (!p) {\n              box.style.background = '#fffbeb'; box.style.borderColor = '#f59e0b'; box.style.color = '#92400e';\n              box.innerHTML = '⏳ <b>还没收到任何心跳</b> —— 说明抓题脚本<b>一次都没在浏览器里跑起来过</b>。<br>' +\n                '请先按上面的步骤把脚本装进篡改猴（确认扩展已启用、且脚本开关是开着的），然后打开任意题目页刷新一次，这里的提示会自动变绿。';\n              return;\n            }\n            var fresh = (j.now - p.at) < 10 * 60 * 1000;\n            box.style.background = fresh ? '#f0fdf4' : '#fffbeb';\n            box.style.borderColor = fresh ? '#86efac' : '#f59e0b';\n            box.style.color = fresh ? '#166534' : '#92400e';\n            box.innerHTML = (fresh ? '✅ ' : '🕘 ') + '最近一次心跳：<b>' + (p.host || '?') + '</b> v' + (p.version || '?') +\n              ' · ' + hhmmss(p.at) + (fresh ? '' : '（已经超过 10 分钟）') + '<br>' +\n              '页面标题：' + (p.title || '(空)') + '<br>' +\n              '<span style=\"font-size:12px;opacity:.75;\">' + (p.url || '') + '</span>';\n          })\n          .catch(function () {});\n      }\n      tick();\n      setInterval(tick, 3000);\n    })();\n  </script>\n</body>\n</html>",
    'tampermonkey/Hydro-Helper.user.js': "// ==UserScript==\n// @name         Hydro 通用全能助手\n// @namespace    http://tampermonkey.net/\n// @version      8.5\n// @description  适配任意 Hydro 部署（kedaoi、自建 Hydro 站…）：抓样例到 CPH，并同步 Cookie / URL / 题面 Markdown / 语言到本地 Server\n// @author       You\n// @match        *://*/*\n// @match        https://kedaoi.cn/*\n// @match        https://*.kedaoi.cn/*\n// @include      *://*/*\n// @run-at       document-idle\n// @grant        GM_xmlhttpRequest\n// @connect      localhost\n// @connect      127.0.0.1\n// @updateURL    http://localhost:27122/tampermonkey/Hydro-Helper.user.js\n// @downloadURL  http://localhost:27122/tampermonkey/Hydro-Helper.user.js\n// @noframes\n// ==/UserScript==\n\n(function () {\n    'use strict';\n\n    /* ──────── 可配置项 ──────── */\n    // 留空 = 任何看起来像 Hydro 题库页的站点都生效（通用模式）。\n    // 只想在自己常用的站点生效时填域名，例如：['kedaoi.cn', 'oj.example.com']\n    const ONLY_HOSTS = [];\n\n    const SYNC_SERVER_URL  = 'http://localhost:27122/api/sync';\n    const CPH_SERVER_URL   = 'http://localhost:27121';\n    const MAX_INPUT_BYTES  = 5 * 1024 * 1024;\n    const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;\n    const MAX_TESTS        = 0;                 // 0 = 不限制\n    const SCRIPT_VERSION = '8.5';\n    const log = (...a) => console.log('[Hydro助手]', ...a);\n    // 心跳：脚本在本页真的跑起来了就告诉本地服务一声（安装页 /install.html 会显示）\n    function ping() {\n        try {\n            GM_xmlhttpRequest({\n                method: 'POST', url: SYNC_SERVER_URL.replace('/api/sync', '/api/ping') + '?t=' + Date.now(),\n                headers: { 'Content-Type': 'application/json' },\n                data: JSON.stringify({ url: location.href, title: document.title, host: location.hostname, version: SCRIPT_VERSION }),\n                timeout: 5000,\n                onload: r => log('心跳 ok ' + r.status),\n                onerror: () => log('心跳失败：本地服务没启动？')\n            });\n        } catch (e) { log('心跳异常', e.message); }\n    }\n\n    /* ──────── 站点 / 页面识别 ──────── */\n    function hostAllowed() {\n        if (!ONLY_HOSTS.length) return true;\n        const h = location.hostname.toLowerCase();\n        return ONLY_HOSTS.some(d => {\n            const host = String(d).toLowerCase().trim();\n            return h === host || h.endsWith('.' + host);\n        });\n    }\n\n    function pageType() {\n        const de = document.documentElement;\n        return String(de.dataset.page || de.getAttribute('data-page') || '').toLowerCase();\n    }\n\n    // Hydro 会把页面数据挂在 window.UiContext / UiContextNew 上（不同版本不同）\n    function uiContext() {\n        try {\n            const n = window.UiContextNew;\n            if (n) return typeof n === 'string' ? JSON.parse(n) : n;\n            if (window.UiContext) return window.UiContext;\n        } catch (e) { /* 忽略：非 Hydro 页面 */ }\n        return null;\n    }\n\n    // 只用 data-page 判断会把普通网站误当成题库，所以叠加路由/上下文特征打分。\n    // Hydro 的题页路径有站内题 /p/<id>、域内题 /d/<domain>/p/<id>、旧版 /problem/<id> 几种\n    function isProblemPath() {\n        const path = location.pathname;\n        return /\\/(p|problem)\\/[^/?#]+/i.test(path) || /\\/d\\/[^/]+\\/p\\/[^/?#]+/i.test(path);\n    }\n\n    function looksLikeHydroProblem() {\n        if (!hostAllowed()) return false;\n        const pt = pageType();\n        if (pt.includes('submit')) return false;\n        const pathHit = isProblemPath();\n        const ctx = uiContext();\n        const domHit = !!document.querySelector('.problem-content, [data-fragment-id^=\"problem\"], pre > code[class*=\"language-input\"]');\n        // 题页路径 + Hydro 上下文/题面容器任一命中即放行（登录墙、懒渲染都不影响）\n        if (pathHit && (ctx || pt.includes('problem') || domHit)) return true;\n        if (pathHit) return true; // 路径本身就是强特征：/p/<id> 这种 Hydro 约定，误判成本只是多一个按钮\n        let score = 0;\n        if (ctx) score++;\n        if (domHit) score++;\n        if (pt.includes('problem')) return score >= 1;\n        return score >= 2;\n    }\n\n    let btn = null;\n\n    function init() {\n        btn = document.createElement('button');\n        btn.textContent = '发送到 CPH';\n        Object.assign(btn.style, {\n            position: 'fixed', bottom: '100px', right: '20px', zIndex: 9999,\n            padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white',\n            border: 'none', borderRadius: '5px', cursor: 'pointer',\n            boxShadow: '0 2px 5px rgba(0,0,0,0.3)', fontSize: '14px'\n        });\n        btn.title = 'Hydro 通用助手 · ' + location.hostname;\n        document.body.appendChild(btn);\n\n        let abort = false, running = false;\n        btn.addEventListener('click', async () => {\n            if (running) { abort = true; setStatus('正在停止...', '#FF9800'); return; }\n            abort = false; running = true; setStatus('处理中...', '#FFA500');\n            syncToServer().catch(e => log('同步失败', e.message));\n            try {\n                const data = await collectProblemData();\n                if (abort) { setStatus('已取消', '#9E9E9E'); return; }\n                if (!data || data.tests.length === 0) {\n                    setStatus('未找到样例', '#f44336');\n                } else {\n                    setStatus('发送 ' + data.tests.length + ' 组...', '#FFA500');\n                    await sendToCPH(data);\n                    const label = (data.name || '').slice(0, 12);\n                    setStatus('已发送 ' + data.tests.length + ' 组' + (label ? ' · ' + label : ''), '#4CAF50');\n                    log('已同步题面并将样例发送到 CPH：' + data.tests.length + ' 组，语言 ' + (await detectSubmitInfo()).lang);\n                }\n            } catch (e) {\n                console.error(e); setStatus('错误: ' + e.message, '#f44336');\n            } finally {\n                running = false;\n                setTimeout(() => { if (!running) setStatus('发送到 CPH', '#4CAF50'); }, 3000);\n            }\n        });\n    }\n\n    // 页面可能异步渲染（Hydro 有时 SPA 化插件在场），给更长的重试窗口\n    (function boot() {\n        let tries = 0;\n        function attempt() {\n            if (!btn && window.top === window && looksLikeHydroProblem() && document.body) { init(); return; }\n            if (++tries < 40) setTimeout(attempt, 500); // 约 20 秒\n        }\n        attempt();\n\n        // 打印一次识别结果，方便在控制台确认脚本到底有没有跑、为什么没出按钮\n        log('页面识别', {\n            url: location.href,\n            dataPage: pageType() || '(空)',\n            problemPath: isProblemPath(),\n            hasUiContext: !!uiContext(),\n            problemDom: !!document.querySelector('.problem-content, [data-fragment-id^=\"problem\"]'),\n            matched: looksLikeHydroProblem()\n        });\n\n        // 留个 DOM 记号：在元素面板看到 data-hydro-helper 就说明脚本确实注入了\n        // 只在顶层窗口留记号/打心跳：去掉 @noframes 后 iframe 里也会跑，避免重复\n        if (window.top === window) {\n            document.documentElement.dataset.hydroHelper = SCRIPT_VERSION;\n            ping();\n        }\n\n        // SPA 站点切换页面后重新判断（Hydro 多标签/站内跳转会复用 document）\n        let last = location.href;\n        setInterval(() => {\n            if (location.href === last) return;\n            last = location.href;\n            tries = 0;\n            if (btn && !looksLikeHydroProblem()) { btn.remove(); btn = null; }\n            attempt();\n        }, 1000);\n    })();\n\n    function setStatus(text, color) {\n        if (!btn) return;\n        btn.textContent = text; btn.style.backgroundColor = color;\n    }\n\n    /* ──────── 题面 / 元信息 ──────── */\n    function toMs(v) {\n        if (v === null || v === undefined || v === '') return 0;\n        if (typeof v === 'number') return v < 100 ? Math.round(v * 1000) : Math.round(v);\n        const m = String(v).match(/([\\d.]+)\\s*(ms|毫秒|s|秒|sec|m|min)?/i);\n        if (!m) return 0;\n        const n = parseFloat(m[1]);\n        const unit = (m[2] || 's').toLowerCase();\n        return (unit === 'ms' || unit === '毫秒') ? Math.round(n) : Math.round(n * 1000);\n    }\n\n    function toMb(v) {\n        if (v === null || v === undefined || v === '') return 0;\n        if (typeof v === 'number') return Math.round(v);\n        const m = String(v).match(/([\\d.]+)\\s*(mb|m|g|gb|kb|k)?/i);\n        if (!m) return 0;\n        const n = parseFloat(m[1]);\n        const unit = (m[2] || 'm').toLowerCase();\n        if (unit === 'g' || unit === 'gb') return Math.round(n * 1024);\n        if (unit === 'k' || unit === 'kb') return Math.round(n / 1024);\n        return Math.round(n);\n    }\n\n    function problemMeta() {\n        let name = '', timeLimit = 1000, memoryLimit = 256;\n        const ctx = uiContext();\n        const pdoc = ctx && ctx.pdoc ? ctx.pdoc : null;\n        let cfg = {};\n        if (pdoc) {\n            name = pdoc.title || '';\n            cfg = pdoc.config || {};\n            timeLimit = cfg.timeMin || toMs(cfg.time) || timeLimit;\n            memoryLimit = cfg.memoryMin || toMb(cfg.memory) || memoryLimit;\n        }\n        if (!name) {\n            const h1s = document.querySelectorAll('h1.section__title, .problem-content h1, h1');\n            for (const h of h1s) {\n                const t = (h.textContent || '').trim();\n                if (t && !/^递交|^题目详情|^登录|^注册|^讨论/.test(t)) { name = t; break; }\n            }\n        }\n        if (!name) name = document.title;\n        name = name.replace(/^\\d+\\s+/, '').replace(/^#?[A-Z]*\\d+\\.\\s*/, '').replace(/^[A-Z]\\.\\s*/, '').trim();\n\n        // 兜底：直接从题面文字里抠限制（不同 Hydro 主题/版本字段名不一致）\n        const text = document.body ? document.body.innerText : '';\n        if (!cfg.timeMin) {\n            const m = text.match(/(?:时间限制|时限|Time limit)[：:\\s]*([\\d.]+)\\s*(ms|毫秒|s|秒|sec)?/i);\n            if (m) timeLimit = toMs(m[1] + (m[2] || 's'));\n        }\n        if (!cfg.memoryMin) {\n            const m = text.match(/(?:内存限制|空间限制|Memory limit)[：:\\s]*([\\d.]+)\\s*(mb|m|gb|g|kb|k)?/i);\n            if (m) memoryLimit = toMb(m[1] + (m[2] || 'm'));\n        }\n        return { name, timeLimit, memoryLimit };\n    }\n\n    // 类 Hydro 主题各不相同，但题面都是渲染后的 HTML；转成 markdown 才能让 Problem.md 可读\n    function htmlToMarkdown(root) {\n        const out = [];\n        const inline = n => {\n            if (n.nodeType === 3) return n.nodeValue.replace(/\\s+/g, ' ');\n            if (n.nodeType !== 1) return '';\n            const tag = n.tagName.toLowerCase();\n            const inner = [...n.childNodes].map(inline).join('');\n            if (tag === 'code') return '`' + inner + '`';\n            if (tag === 'strong' || tag === 'b') return '**' + inner + '**';\n            if (tag === 'em' || tag === 'i') return '*' + inner + '*';\n            if (tag === 'br') return '\\n';\n            if (tag === 'a') return '[' + inner.trim() + '](' + (n.getAttribute('href') || '') + ')';\n            if (tag === 'img') return '![' + (n.getAttribute('alt') || '') + '](' + (n.getAttribute('src') || '') + ')';\n            return inner;\n        };\n        const block = n => {\n            if (n.nodeType === 3) { const t = n.nodeValue.trim(); if (t) out.push(t); return; }\n            if (n.nodeType !== 1) return;\n            const tag = n.tagName.toLowerCase();\n            if (/^h[1-6]$/.test(tag)) { out.push('#'.repeat(+tag[1]) + ' ' + inline(n).trim()); return; }\n            if (tag === 'pre') {\n                const codeEl = n.querySelector('code');\n                const cls = (codeEl && codeEl.className) || n.className || '';\n                const m = String(cls).match(/language-([\\w+-]+)/);\n                out.push('```' + (m ? m[1] : '') + '\\n' + n.textContent.replace(/\\n+$/, '') + '\\n```');\n                return;\n            }\n            if (tag === 'ul' || tag === 'ol') {\n                [...n.querySelectorAll(':scope > li')].forEach((li, i) => {\n                    out.push((tag === 'ol' ? (i + 1) + '. ' : '- ') + inline(li).trim());\n                });\n                return;\n            }\n            if (tag === 'table') { out.push(inline(n).replace(/\\s+/g, ' ').trim()); return; }\n            if (['p', 'div', 'section', 'blockquote'].includes(tag)) {\n                const t = inline(n).trim();\n                if (t) out.push(tag === 'blockquote' ? '> ' + t : t);\n                return;\n            }\n            [...n.childNodes].forEach(block);\n        };\n        [...root.childNodes].forEach(block);\n        return out.join('\\n\\n').replace(/\\n{3,}/g, '\\n\\n').trim();\n    }\n\n    function pickMarkdown() {\n        const ctx = uiContext();\n        let md = '';\n        if (ctx && ctx.pdoc && ctx.pdoc.content) {\n            let raw = ctx.pdoc.content;\n            if (typeof raw === 'string' && raw.trim().startsWith('{')) {\n                try {\n                    const parsed = JSON.parse(raw);\n                    raw = parsed.zh || parsed.en || Object.values(parsed)[0] || raw;\n                } catch (e) { /* 不是多语言 JSON，就用原文 */ }\n            }\n            md = raw;\n        }\n        if (!md) {\n            const nodes = [\n                '.problem-content',\n                '[data-fragment-id=\"problem-description\"]',\n                '[data-fragment-id^=\"problem\"] .section__body',\n                '.section__body.typo'\n            ];\n            for (const sel of nodes) {\n                const el = document.querySelector(sel);\n                if (!el) continue;\n                const clone = el.cloneNode(true);\n                clone.querySelectorAll('.section__header, .div-btn-copy, .split-line, .toolbar, script').forEach(n => n.remove());\n                md = htmlToMarkdown(clone);\n                if (md.trim()) break;\n            }\n        }\n        return String(md || '')\n            .replace(/<!--[\\s\\S]*?-->/g, '')\n            .replace(/(?:Copy|填充到自测)/g, '')\n            .replace(/\\n{3,}/g, '\\n\\n')\n            .trim();\n    }\n\n    /* ──────── 提交语言识别（不同 Hydro 站的 lang 枚举不同） ──────── */\n    function problemBase() {\n        let u = location.href.split('#')[0];\n        u = u.replace(/\\/(submit|code|solution|solutions|stat|scoreboard|discussion)\\b[\\s\\S]*$/, '');\n        return u.replace(/\\/$/, '');\n    }\n\n    function submitUrl() {\n        return problemBase() + '/submit' + (location.search || '');\n    }\n\n    function pickCpp(values) {\n        const vals = values.map(o => String(o || '').trim()).filter(Boolean);\n        const find = re => vals.find(v => re.test(v));\n        return find(/^cc\\..*(17|std17)/i) || find(/^cc\\./i) || find(/cpp|c\\+\\+/i) || vals[0] || '';\n    }\n\n    // 从页面（或 /submit 页）读取：可用语言列表、要提交的 C++ 语言、CSRF 令牌\n    function readSubmitInfo(doc) {\n        const pick = sel => [...doc.querySelectorAll(sel)];\n        const langs = pick('select[name=\"lang\"] option, select[name=\"language\"] option')\n            .map(o => o.value || o.textContent || '')\n            .map(v => v.trim())\n            .filter(v => v && v !== '-');\n        const csrfEl = doc.querySelector('input[name=\"_csrf\"]');\n        return {\n            langs,\n            lang: pickCpp(langs),\n            csrf: csrfEl ? csrfEl.value : ''\n        };\n    }\n\n    async function detectSubmitInfo() {\n        const fromPage = readSubmitInfo(document);\n        if (fromPage.lang || fromPage.csrf) return fromPage;\n\n        // 题目页一般不带递交表单，就去同站 /submit 抓一次（语言 + CSRF 令牌）\n        const cacheKey = 'hydro-submit:' + location.host + location.pathname;\n        try {\n            const c = sessionStorage.getItem(cacheKey);\n            if (c) { const o = JSON.parse(c); if (o && o.lang) return o; }\n        } catch (e) { /* 隐私模式 / 缓存损坏 */ }\n\n        try {\n            const res = await fetch(submitUrl(), { credentials: 'include' });\n            if (!res.ok) return fromPage;\n            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');\n            const info = readSubmitInfo(doc);\n            if (info.lang) { try { sessionStorage.setItem(cacheKey, JSON.stringify(info)); } catch (e) { /* 忽略 */ } }\n            return info;\n        } catch (e) {\n            log('递交信息识别失败，交给服务端默认值', e.message);\n            return fromPage;\n        }\n    }\n\n    /* ──────── 同步到本地服务 ──────── */\n    async function syncToServer() {\n        const url = location.href.split('#')[0];\n        const meta = problemMeta();\n        const info = await detectSubmitInfo();\n        try {\n            GM_xmlhttpRequest({\n                method: 'POST', url: SYNC_SERVER_URL,\n                headers: { 'Content-Type': 'application/json' },\n                data: JSON.stringify({\n                    cookie: document.cookie,\n                    url: url,\n                    markdown: pickMarkdown(),\n                    lang: info.lang,\n                    langs: info.langs,\n                    csrf: info.csrf,\n                    title: meta.name\n                })\n            });\n        } catch (e) { log('同步请求失败', e.message); }\n    }\n\n    /* ──────── 样例抓取 ──────── */\n    function normalize(s) {\n        return String(s).replace(/\\r\\n/g, '\\n').replace(/[ \\t]+$/gm, '').replace(/^\\n+|\\n+$/g, '');\n    }\n\n    function dedupe(tests) {\n        const seen = new Set(), out = [];\n        for (const t of tests) {\n            const key = normalize(t.input) + '\\u0000' + normalize(t.output);\n            if (!seen.has(key)) { seen.add(key); out.push(t); }\n        }\n        return out;\n    }\n\n    function pickSamples() {\n        const pairs = [\n            ['pre > code[class*=\"language-input\"]', 'pre > code[class*=\"language-output\"]'],\n            ['pre > code[class*=\"language-in\"]',    'pre > code[class*=\"language-out\"]'],\n            ['pre > code.input',                    'pre > code.output'],\n            ['[data-fragment-id] pre > code[class*=\"input\"]', '[data-fragment-id] pre > code[class*=\"output\"]'],\n            ['div.sample-test .input pre', 'div.sample-test .output pre'],\n            ['div.sample-test pre:nth-of-type(1)', 'div.sample-test pre:nth-of-type(2)']\n        ];\n        for (const [inSel, outSel] of pairs) {\n            const ins = [...document.querySelectorAll(inSel)];\n            const outs = [...document.querySelectorAll(outSel)];\n            const n = Math.min(ins.length, outs.length);\n            if (n > 0) {\n                const tests = [];\n                for (let i = 0; i < n; i++) tests.push({ input: ins[i].textContent, output: outs[i].textContent });\n                return tests;\n            }\n        }\n        return [];\n    }\n\n    async function collectProblemData() {\n        const meta = problemMeta();\n        const tests = pickSamples();\n        const zipUrl = findExtraZipUrl();\n        if (zipUrl) {\n            const extra = await downloadAndParseZip(zipUrl);\n            tests.push(...extra);\n        }\n        return {\n            name: meta.name,\n            group: 'Hydro · ' + location.hostname,\n            url: location.href,\n            interactive: false,\n            memoryLimit: meta.memoryLimit,\n            timeLimit: meta.timeLimit,\n            tests: dedupe(tests),\n            testType: 'single',\n            input: { type: 'stdin' }, output: { type: 'stdout' },\n            languages: { cpp: { compiler: 'g++' } }\n        };\n    }\n\n    function findExtraZipUrl() {\n        const headers = document.querySelectorAll('h1, h2, h3, h4');\n        for (const h of headers) {\n            if (/额外样例|样例下载|样例文件|附件下载|大小样例|样例包|附加样例|下载样例/.test(h.textContent || '')) {\n                let node = h.nextElementSibling;\n                while (node && !/^H[1-4]$/.test(node.tagName)) {\n                    const a = (node.querySelector && node.querySelector('a[href*=\".zip\"]')) ||\n                              (node.tagName === 'A' && String(node.href).includes('.zip') ? node : null);\n                    if (a) return a.href;\n                    node = node.nextElementSibling;\n                }\n            }\n        }\n        for (const a of document.querySelectorAll('a[href*=\".zip\"]')) {\n            if (/样例|sample|extra|附件|下载/i.test(a.textContent || '')) return a.href;\n        }\n        return null;\n    }\n\n    async function downloadAndParseZip(url) {\n        const resp = await fetch(url, { credentials: 'include' });\n        const buf = await resp.arrayBuffer();\n        const unzipped = await unzipNative(buf);\n        const decoder = new TextDecoder('utf-8'), files = {};\n        for (const [path, data] of Object.entries(unzipped)) {\n            const name = path.split('/').pop().toLowerCase();\n            if (/\\.(in|ans|out)$/.test(name) && data.length <= (/\\.in$/.test(name) ? MAX_INPUT_BYTES : MAX_OUTPUT_BYTES)) files[name] = decoder.decode(data);\n        }\n        const tests = [], inKeys = Object.keys(files).filter(k => k.endsWith('.in')).sort();\n        for (const inKey of inKeys) {\n            const base = inKey.slice(0, -3);\n            const ansKey = files[base + '.ans'] ? base + '.ans' : (files[base + '.out'] ? base + '.out' : null);\n            if (ansKey) tests.push({ input: files[inKey], output: files[ansKey] });\n        }\n        return tests;\n    }\n\n    async function unzipNative(arrayBuffer) {\n        const view = new DataView(arrayBuffer);\n        let eocd = -1;\n        for (let i = arrayBuffer.byteLength - 22; i >= 0; i--) if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }\n        if (eocd < 0) return {};\n        const cdCount = view.getUint16(eocd + 10, true), cdOffset = view.getUint32(eocd + 16, true), result = {};\n        let p = cdOffset;\n        for (let i = 0; i < cdCount; i++) {\n            const method = view.getUint16(p + 10, true), compSize = view.getUint32(p + 20, true), nameLen = view.getUint16(p + 28, true);\n            const extraLen = view.getUint16(p + 30, true), commentLen = view.getUint16(p + 32, true), localOffset = view.getUint32(p + 42, true);\n            const name = new TextDecoder('utf-8').decode(new Uint8Array(arrayBuffer, p + 46, nameLen));\n            const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);\n            const compData = new Uint8Array(arrayBuffer, dataStart, compSize);\n            if (method === 0) result[name] = compData;\n            else if (method === 8) {\n                const ds = new DecompressionStream('deflate-raw'), writer = ds.writable.getWriter();\n                writer.write(compData); writer.close();\n                const chunks = [], reader = ds.readable.getReader();\n                while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); }\n                const out = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));\n                let off = 0; for (const c of chunks) { out.set(c, off); off += c.length; }\n                result[name] = out;\n            }\n            p += 46 + nameLen + extraLen + commentLen;\n        }\n        return result;\n    }\n\n    function sendToCPH(data) {\n        return new Promise((resolve, reject) => {\n            GM_xmlhttpRequest({\n                method: 'POST', url: CPH_SERVER_URL, headers: { 'Content-Type': 'application/json' },\n                data: JSON.stringify(data),\n                onload: r => (r.status === 200 || r.status === 0) ? resolve() : reject(new Error('CPH Error')),\n                onerror: () => reject(new Error('CPH 未运行'))\n            });\n        });\n    }\n})();\n",
    'tampermonkey/AtCoder-Plus-CPH.user.js': "// ==UserScript==\n// @name         AtCoder Plus (CPH & VSCode Sync)\n// @namespace    http://tampermonkey.net/\n// @version      8.0\n// @description  抓取样例到CPH，并同步Cookie、URL和题面到本地Server\n// @author       You\n// @match        https://atcoder.jp/contests/*/tasks/*\n// @grant        GM_xmlhttpRequest\n// @grant        GM_addStyle\n// @connect      localhost\n// @connect      127.0.0.1\n// ==/UserScript==\n\n(function () {\n    'use strict';\n    const SYNC_SERVER_URL = 'http://localhost:27122/api/sync', CPH_PORT = 27121;\n\n    GM_addStyle(`\n        #cgh-to-cph-btn { position: fixed; top: 15px; right: 20px; z-index: 9999; padding: 10px 16px; background: #00bcd4; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: all 0.2s; }\n        #cgh-to-cph-btn:hover { background: #008ba3; transform: translateY(-2px); }\n    `);\n\n    const btn = document.createElement('button');\n    btn.id = 'cgh-to-cph-btn'; btn.textContent = '🚀 传送至 CPH / VSCode';\n    document.body.appendChild(btn);\n\n    btn.addEventListener('click', async () => {\n        try {\n            btn.textContent = '⏳ 处理中...'; btn.style.background = '#ff9800';\n            syncToServer();\n            const data = await getData();\n            if (data.tests.length === 0) { alert('未找到样例。'); return; }\n            await sendToCPH(data);\n            btn.textContent = '✅ 已发送'; btn.style.background = '#4caf50';\n        } catch (e) {\n            btn.textContent = '❌ 发送失败'; btn.style.background = '#f44336';\n        } finally {\n            setTimeout(() => { btn.textContent = '🚀 传送至 CPH / VSCode'; btn.style.background = '#00bcd4'; }, 3000);\n        }\n    });\n\n    function syncToServer() {\n        let markdown = '';\n        const statementSpan = document.querySelector('span.lang-en') || document.querySelector('span.lang-ja');\n        if (statementSpan) {\n            const clone = statementSpan.cloneNode(true);\n            clone.querySelectorAll('div.part > section').forEach(sec => {\n                const h3 = sec.querySelector('h3');\n                if (h3 && h3.textContent.includes('Sample')) sec.remove();\n            });\n            clone.querySelectorAll('.div-btn-copy, hr').forEach(el => el.remove());\n            markdown = clone.innerHTML;\n        }\n        GM_xmlhttpRequest({\n            method: 'POST', url: SYNC_SERVER_URL, headers: { 'Content-Type': 'application/json' },\n            data: JSON.stringify({ cookie: document.cookie, url: location.href, markdown: markdown })\n        });\n    }\n\n    async function getData() {\n        const pathParts = window.location.pathname.split('/');\n        const contestId = pathParts[2], problemId = pathParts[4];\n        let timeLimit = 2000, memoryLimit = 1024;\n        const infoNode = document.querySelector('#main-container p');\n        if (infoNode) {\n            const text = infoNode.textContent;\n            const timeMatch = text.match(/Time Limit:\\s*(\\d+)\\s*sec/i), memMatch = text.match(/Memory Limit:\\s*(\\d+)\\s*MB/i);\n            if (timeMatch) timeLimit = parseInt(timeMatch[1]) * 1000;\n            if (memMatch) memoryLimit = parseInt(memMatch[1]);\n        }\n        let preNodes = document.querySelectorAll('span.lang-en > div.part > section > pre');\n        if (preNodes.length === 0) preNodes = document.querySelectorAll('span.lang-ja > div.part > section > pre');\n        const tests = [];\n        for (let i = 0; i < preNodes.length; i += 2) {\n            if (preNodes[i] && preNodes[i+1]) {\n                tests.push({ input: preNodes[i].textContent.trim(), output: preNodes[i+1].textContent.trim() });\n            }\n        }\n        return {\n            name: contestId.replace(/\\d+/g, '').toUpperCase() + \" \" + (contestId.match(/\\d+/g) || [''])[0] + \" \" + problemId.split('_').pop().toUpperCase(),\n            group: contestId.replace(/\\d+/g, '').toUpperCase(), url: window.location.href,\n            interactive: false, memoryLimit, timeLimit, tests, testType: \"single\",\n            input: { type: \"stdin\" }, output: { type: \"stdout\" }, languages: { cpp: { compiler: 'g++' } }\n        };\n    }\n\n    function sendToCPH(data) {\n        return new Promise((resolve, reject) => {\n            GM_xmlhttpRequest({\n                method: 'POST', url: `http://localhost:${CPH_PORT}/`, headers: { 'Content-Type': 'application/json' },\n                data: JSON.stringify(data),\n                onload: r => (r.status === 200 || r.status === 0) ? resolve() : reject(new Error('CPH Error')),\n                onerror: () => reject(new Error('CPH 未运行'))\n            });\n        });\n    }\n})();",
    'hydro-console.js': "/* Hydro 助手 · 控制台版加载器（不需要篡改猴）\n * 用法：在题目页 F12 → Console → 粘贴下面这一行后回车：\n *   fetch('http://localhost:27122/hydro-console.js',{cache:'no-store'}).then(r=>r.text()).then(t=>(0,eval)(t))\n * 原理：用 fetch 补齐 GM_xmlhttpRequest，再把篡改猴脚本源码下载下来执行。\n * 局限：整页刷新（F5）后需要重新粘贴；同一标签页内的站内跳转不用。\n */\n(function () {\n    'use strict';\n    var BASE = 'http://localhost:27122';\n    var tag = '[Hydro助手/console]';\n    function log() { console.log.apply(console, [tag].concat([].slice.call(arguments))); }\n\n    if (window.__hydroConsoleRan) {\n        log('这个页面已经加载过了；如果没看到按钮，先刷新页面再粘贴一次。');\n        return;\n    }\n    window.__hydroConsoleRan = true;\n\n    // GM_xmlhttpRequest 兼容层：篡改猴脚本里的所有网络请求都走这里\n    if (typeof window.GM_xmlhttpRequest !== 'function') {\n        window.GM_xmlhttpRequest = function (opt) {\n            opt = opt || {};\n            var init = {\n                method: (opt.method || 'GET').toUpperCase(),\n                headers: opt.headers || {},\n                credentials: 'omit',\n                cache: 'no-store'\n            };\n            if (opt.data != null) init.body = opt.data;\n            fetch(opt.url, init).then(function (r) {\n                return r.text().then(function (txt) {\n                    var resp = {\n                        status: r.status, statusText: r.statusText, readyState: 4,\n                        responseText: txt, response: txt, finalUrl: opt.url,\n                        responseHeaders: 'content-type: ' + (r.headers.get('content-type') || '')\n                    };\n                    if (typeof opt.onload === 'function') opt.onload(resp);\n                });\n            }).catch(function (e) {\n                if (typeof opt.onerror === 'function') opt.onerror(e);\n            });\n            return { abort: function () {} };\n        };\n        log('已启用 fetch 版 GM_xmlhttpRequest 兼容层');\n    }\n\n    fetch(BASE + '/tampermonkey/Hydro-Helper.user.js?t=' + Date.now(), { cache: 'no-store' })\n        .then(function (r) {\n            if (!r.ok) throw new Error('HTTP ' + r.status);\n            return r.text();\n        })\n        .then(function (src) {\n            try {\n                (0, eval)(src);\n                log('用户脚本已执行，版本 =', document.documentElement.dataset.hydroHelper || '(未标记)');\n            } catch (e) {\n                log('执行用户脚本出错：', e && e.message ? e.message : e);\n            }\n        })\n        .catch(function (e) {\n            log('下载用户脚本失败：', e && e.message ? e.message : e,\n                '—— 本地服务没启动？先双击 start.bat（或 node app.js --serve）。');\n        });\n})();\n",
    'tm-test.user.js': "// ==UserScript==\n// @name         TM 注入自检（3 行）\n// @namespace    http://tampermonkey.net/\n// @version      1.0\n// @description  只做一件事：证明篡改猴到底有没有在这台机器的这个浏览器里注入脚本\n// @match        *://*/*\n// @run-at       document-idle\n// @grant        GM_xmlhttpRequest\n// @connect      localhost\n// @connect      127.0.0.1\n// ==/UserScript==\n\n(function () {\n    'use strict';\n    console.log('[TM自检] 注入成功', location.href);\n    document.documentElement.dataset.tmSelfTest = '1';\n    try { GM_xmlhttpRequest({ method: 'POST', url: 'http://localhost:27122/api/ping', headers: { 'Content-Type': 'application/json' }, data: JSON.stringify({ url: location.href, title: 'TM自检', host: location.hostname, version: 'selftest' }) }); } catch (e) {}\n    setTimeout(function () { alert('✅ 篡改猴注入正常\\n' + location.href + '\\n\\n(这是自检脚本，看完可以删掉)'); }, 800);\n})();\n"
};

const VSCODE_FILES = {
    'tasks.json': "{\n  \"version\": \"2.0.0\",\n  \"tasks\": [\n    {\n      \"type\": \"process\",\n      \"label\": \"g++\",\n      \"command\": \"g++.exe\",\n      \"args\": [\"-g\", \"-O0\", \"-std=c++17\", \"${fileBasename}\", \"-o\", \"${fileBasenameNoExtension}.exe\"],\n      \"options\": { \"cwd\": \"${fileDirname}\" },\n      \"problemMatcher\": [\"$gcc\"],\n      \"group\": { \"kind\": \"build\", \"isDefault\": true }\n    },\n    {\n      \"label\": \"submit code to OJ\",\n      \"type\": \"shell\",\n      \"command\": \"curl\",\n      \"args\": [\"-s\", \"-X\", \"POST\", \"http://localhost:27122/api/submit\"],\n      \"presentation\": { \"reveal\": \"always\", \"panel\": \"shared\", \"clear\": true },\n      \"problemMatcher\": []\n    }\n  ]\n}",
    'keybindings.json': "[\n  {\n    \"key\": \"alt+enter\",\n    \"command\": \"workbench.action.tasks.runTask\",\n    \"args\": \"submit code to OJ\"\n  }\n]"
};

// Hydro-AtCoder-GodMode 唯一安装器：选目录 / 写 .vscode / 绑快捷键 / 起临时服务 / 装常驻服务 / 卸载
const ROOT = __dirname;
const ENTRY_KEY = 'alt+enter';
const ENTRY_TASK = 'submit code to OJ';
const RUNTIME_PORT = 27122;
const PICKER_PS = "\u003c#\n  Hydro-AtCoder-GodMode 选文件夹器（由 installer.js 自动生成并调用，不需要手动执行）\n  优先弹出 Windows 原生 IFileOpenDialog（就是平常“选择文件夹”那个界面），\n  老系统 / 调用失败时回退到 System.Windows.Forms.FolderBrowserDialog。\n  用法：powershell -NoProfile -STA -File pick.ps1 -Initial \u003c起点目录\u003e -Title \u003c标题\u003e -Out \u003c结果文件(UTF-8)\u003e\n  取消选择：退出码 1。\n#\u003e\nparam(\n    [string]$Initial = $env:USERPROFILE,\n    [string]$Title = \u0027请选择用来存放 .cpp 代码的文件夹\u0027,\n    [string]$Out = \u0027\u0027\n)\n\n$ErrorActionPreference = \u0027Stop\u0027\n\nfunction Save-Result([string]$value) {\n    if ($Out) {\n        $enc = New-Object System.Text.UTF8Encoding($false)\n        [System.IO.File]::WriteAllText($Out, $value, $enc)\n    }\n    [Console]::Out.Write($value)\n}\n\nAdd-Type -AssemblyName System.Windows.Forms\nAdd-Type -AssemblyName System.Drawing\n\nif ($Initial) { $Initial = $Initial.Trim().Trim(\u0027\"\u0027) }\nif (-not $Initial -or -not (Test-Path -LiteralPath $Initial)) { $Initial = $env:USERPROFILE }\n\n$nativeType = $null\ntry {\n    Add-Type -TypeDefinition @\u0027\nusing System;\nusing System.IO;\nusing System.Runtime.InteropServices;\n\nnamespace HydroPicker {\n\n    [ComImport, Guid(\"42f85136-db7e-439c-85f1-e4075d135fc8\"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]\n    internal interface IModalWindow {\n        [PreserveSig] int Show(IntPtr hwndParent);\n    }\n\n    [ComImport, Guid(\"d57c7288-d4ad-4768-be02-9d969532d960\"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]\n    internal interface IFileOpenDialog {\n        [PreserveSig] int Show(IntPtr hwndParent);\n        void SetFileTypes(uint cFileTypes, IntPtr rgFilterSpec);\n        void SetFileTypeIndex(uint iFileType);\n        void GetFileTypeIndex(out uint piFileType);\n        void Advise(IntPtr pfde, out uint pdwCookie);\n        void Unadvise(uint dwCookie);\n        void SetOptions(uint fos);\n        void GetOptions(out uint pfos);\n        void SetDefaultFolder(IShellItem psi);\n        void SetFolder(IShellItem psi);\n        void GetFolder(out IntPtr ppsi);\n        void GetCurrentSelection(out IntPtr ppsi);\n        void SetFileName([MarshalAs(UnmanagedType.LPWStr)] string pszName);\n        void GetFileName([MarshalAs(UnmanagedType.LPWStr)] out string pszName);\n        void SetTitle([MarshalAs(UnmanagedType.LPWStr)] string pszTitle);\n        void SetOkButtonLabel([MarshalAs(UnmanagedType.LPWStr)] string pszText);\n        void SetFileNameLabel([MarshalAs(UnmanagedType.LPWStr)] string pszLabel);\n        void GetResult(out IntPtr ppsi);\n        void AddPlace(IntPtr psi, int fdap);\n        void SetDefaultExtension([MarshalAs(UnmanagedType.LPWStr)] string pszDefaultExtension);\n        void Close(int hr);\n        void SetClientGuid(ref Guid guid);\n        void ClearClientData();\n        void SetFilter(IntPtr pFilter);\n        void GetResults(out IntPtr ppenum);\n        void GetSelectedItems(out IntPtr ppsai);\n    }\n\n    [ComImport, Guid(\"43826d1e-e718-42ee-bc55-a1e261c37bfe\"), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]\n    internal interface IShellItem {\n        void BindToHandler(IntPtr pbc, ref Guid bhid, ref Guid riid, out IntPtr ppv);\n        void GetParent(out IntPtr ppsi);\n        void GetDisplayName(uint sigdnName, [MarshalAs(UnmanagedType.LPWStr)] out string ppszName);\n        void GetAttributes(uint sfgaoMask, out uint psfgaoAttribs);\n        void Compare(IntPtr psi, uint hint, out int piOrder);\n    }\n\n    [ComImport, Guid(\"DC1C5A9C-E88A-4dde-A5A1-60F82A20AEF7\")]\n    internal class FileOpenDialogCoClass { }\n\n    public static class FolderPickerNative {\n        const uint FOS_PICKFOLDERS = 0x00000020;\n        const uint FOS_FORCEFILESYSTEM = 0x00000040;\n        const uint FOS_PATHMUSTEXIST = 0x00000800;\n        const uint FOS_NOCHANGEDIR = 0x00000008;\n        const uint SIGDN_FILESYSPATH = 0x80058000;\n\n        [DllImport(\"shell32.dll\", CharSet = CharSet.Unicode, PreserveSig = false)]\n        static extern void SHCreateItemFromParsingName(\n            [MarshalAs(UnmanagedType.LPWStr)] string pszPath,\n            IntPtr pbc,\n            ref Guid riid,\n            [MarshalAs(UnmanagedType.Interface)] out object ppv);\n\n        static IShellItem CreateItem(string path) {\n            Guid iid = typeof(IShellItem).GUID;\n            object item;\n            SHCreateItemFromParsingName(path, IntPtr.Zero, ref iid, out item);\n            return (IShellItem)item;\n        }\n\n        public static bool TryPick(string title, string initial, IntPtr owner, out string path) {\n            path = null;\n            IFileOpenDialog dialog = null;\n            try {\n                dialog = (IFileOpenDialog)new FileOpenDialogCoClass();\n                uint options;\n                dialog.GetOptions(out options);\n                dialog.SetOptions(options | FOS_PICKFOLDERS | FOS_FORCEFILESYSTEM | FOS_PATHMUSTEXIST | FOS_NOCHANGEDIR);\n                if (!string.IsNullOrEmpty(title)) dialog.SetTitle(title);\n                if (!string.IsNullOrEmpty(initial) \u0026\u0026 Directory.Exists(initial)) {\n                    try { dialog.SetFolder(CreateItem(initial)); } catch (Exception) { }\n                }\n                int hr = dialog.Show(owner);\n                if (hr != 0) return true;\n                IntPtr itemPtr;\n                dialog.GetResult(out itemPtr);\n                if (itemPtr == IntPtr.Zero) return true;\n                var item = (IShellItem)Marshal.GetObjectForIUnknown(itemPtr);\n                try { item.GetDisplayName(SIGDN_FILESYSPATH, out path); }\n                finally { Marshal.ReleaseComObject(item); Marshal.Release(itemPtr); }\n                return true;\n            } catch (Exception) {\n                return false;\n            } finally {\n                if (dialog != null) { try { Marshal.ReleaseComObject(dialog); } catch (Exception) { } }\n            }\n        }\n    }\n}\n\u0027@ -ErrorAction Stop\n    $nativeType = [HydroPicker.FolderPickerNative]\n} catch {\n    $nativeType = $null\n}\n\n$ownerForm = New-Object System.Windows.Forms.Form\n$ownerForm.Text = \u0027Hydro-AtCoder-GodMode\u0027\n$ownerForm.ShowInTaskbar = $false\n$ownerForm.FormBorderStyle = \u0027None\u0027\n$ownerForm.StartPosition = \u0027CenterScreen\u0027\n$ownerForm.Size = New-Object System.Drawing.Size(1, 1)\n$ownerForm.TopMost = $true\n$ownerForm.Opacity = 0.01\n$ownerForm.Show()\n$ownerForm.Activate()\n\n$picked = $null\ntry {\n    if ($nativeType) {\n        try {\n            $ok = $nativeType::TryPick($Title, $Initial, $ownerForm.Handle, [ref]$picked)\n            if ($ok) { if ([string]::IsNullOrWhiteSpace($picked)) { exit 1 } }\n        } catch {\n            $picked = $null\n        }\n    }\n    if ([string]::IsNullOrWhiteSpace($picked)) {\n        $dialog = New-Object System.Windows.Forms.FolderBrowserDialog\n        $dialog.Description = $Title\n        $dialog.ShowNewFolderButton = $true\n        try { $dialog.SelectedPath = $Initial } catch { }\n        $dialogResult = $dialog.ShowDialog($ownerForm)\n        if ($dialogResult -ne [System.Windows.Forms.DialogResult]::OK) { exit 1 }\n        $picked = $dialog.SelectedPath\n    }\n} finally {\n    try { $ownerForm.Close(); $ownerForm.Dispose() } catch { }\n}\n\nif ([string]::IsNullOrWhiteSpace($picked)) { exit 1 }\n\n$picked = $picked.Trim().Trim(\u0027\"\u0027)\nwhile ($picked.Length -gt 3 -and $picked.EndsWith([string][char]92)) { $picked = $picked.Substring(0, $picked.Length - 1) }\n\nSave-Result $picked\nexit 0\n";

const args = process.argv.slice(2);
const flag = name => args.includes('--' + name);
const envFlag = name => process.env['HYDRO_' + name] ? true : false;

function log() { console.log.apply(console, arguments); }
function blank() { log(''); }

function readlineOnce(question) {
    return new Promise(resolve => {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        let done = false;
        const finish = answer => { if (done) return; done = true; try { rl.close(); } catch (e) { /* 忽略 */ } resolve(String(answer || '').trim()); };
        rl.question(question, finish);
        rl.on('close', () => finish(''));
    });
}

function pause(text) { return readlineOnce(text || '按回车继续…'); }

// 非交互环境（如从别的进程调用）PATH 里可能没有 powershell，优先用绝对路径
function psExe() {
    const full = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32', 'WindowsPowerShell', 'v1.0', 'powershell.exe');
    try { if (fs.existsSync(full)) return full; } catch (e) { /* 忽略 */ }
    return 'powershell.exe';
}
function pickFolder(initial) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hydro-pick-'));
    const psFile = path.join(dir, 'pick.ps1');
    const outFile = path.join(dir, 'out.txt');
    fs.writeFileSync(psFile, '\uFEFF' + PICKER_PS, 'utf8');
    spawnSync(psExe(), ['-NoProfile', '-STA', '-ExecutionPolicy', 'Bypass', '-File', psFile, '-Initial', initial, '-Out', outFile], { stdio: 'inherit' });
    let picked = '';
    try { picked = fs.readFileSync(outFile, 'utf8').replace(/^\uFEFF/, '').trim(); } catch (e) { picked = ''; }
    try { fs.rmSync(dir, { recursive: true, force: true }); } catch (e) { /* 忽略 */ }
    return picked;
}

async function chooseWorkspace() {
    const fallback = path.join(os.homedir(), 'Desktop');
    for (let i = 0; i < 3; i++) {
        log('请选择用来存放 .cpp 代码的文件夹（会弹出系统选择框）…');
        const picked = pickFolder(fs.existsSync(fallback) ? fallback : os.homedir());
        if (!picked) { log('已取消选择。'); break; }
        if (fs.existsSync(picked) && fs.statSync(picked).isDirectory()) return picked;
        log('这个路径不可用：' + picked);
    }
    const typed = await readlineOnce('手动输入工作区目录（直接回车放弃）: ');
    return typed ? typed.replace(/^"|"$/g, '').trim() : '';
}

function tasksJson(ws) {
    const appJs = path.join(runtimeDir(), 'app.js').replace(/\\/g, '/');
    const tasks = [
        {
            type: 'process', label: 'g++', command: 'g++.exe',
            args: ['-g', '-O0', '-std=c++17', '${fileBasename}', '-o', '${fileBasenameNoExtension}.exe'],
            options: { cwd: '${fileDirname}' },
            problemMatcher: ['$gcc'],
            group: { kind: 'build', isDefault: true }
        },
        {
            label: 'submit code to OJ', type: 'shell', command: 'curl',
            args: ['-s', '-X', 'POST', 'http://localhost:27122/api/submit'],
            presentation: { reveal: 'always', panel: 'shared', clear: true },
            problemMatcher: []
        },
        {
            label: 'start server', type: 'shell', command: 'node',
            args: [appJs, '--serve'],
            isBackground: true,
            runOptions: { runOn: 'folderOpen' },
            problemMatcher: [],
            presentation: { reveal: 'silent', panel: 'dedicated' }
        },
        {
            label: 'open problem', type: 'shell', command: 'code',
            args: ['-r', path.join(ws || '.', 'Problem.md').replace(/\\/g, '/')],
            presentation: { reveal: 'never' },
            problemMatcher: []
        }
    ];
    return JSON.stringify({ version: '2.0.0', tasks }, null, 4) + '\n';
}

function setupWorkspace(ws) {
    const dir = path.join(ws, '.vscode');
    fs.mkdirSync(dir, { recursive: true });
    for (const f of Object.keys(VSCODE_FILES)) {
        const dst = path.join(dir, f);
        if (fs.existsSync(dst)) { log('[vscode] 保留已有 ' + f); continue; }
        fs.writeFileSync(dst, f === 'tasks.json' ? tasksJson(ws) : VSCODE_FILES[f], 'utf8');
        log('[vscode] 已写入 ' + dst);
    }
}

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

function pickKeybindingTarget(explicit) {
    if (explicit) return { name: 'custom', file: path.resolve(explicit) };
    const list = candidatePaths();
    for (const pair of list) if (fs.existsSync(pair[1])) return { name: pair[0], file: pair[1] };
    for (const pair of list) if (fs.existsSync(path.dirname(pair[1]))) return { name: pair[0], file: pair[1] };
    return { name: list[0][0], file: list[0][1] };
}

function stripJsonc(text) {
    let out = text.replace(/\/\*[\s\S]*?\*\//g, '');
    out = out.replace(/^\s*\/\/.*$/gm, '');
    out = out.replace(/,\s*([}\]])/g, '$1');
    return out;
}

function alreadyBound(text) {
    return text.toLowerCase().includes(ENTRY_KEY) && text.includes(ENTRY_TASK);
}

function insertEntry(text) {
    const entry = '    {\n        "key": "alt+enter",\n        "command": "workbench.action.tasks.runTask",\n        "args": "submit code to OJ"\n    }';
    const trimmed = text.trim();
    if (!trimmed) return '[\n' + entry + '\n]\n';
    const closeIdx = text.lastIndexOf(']');
    if (closeIdx === -1) throw new Error('keybindings.json 里找不到结尾的 ]');
    const before = text.slice(0, closeIdx).replace(/\s+$/, '').replace(/,+$/, '');
    const after = text.slice(closeIdx);
    const isEmptyArray = /\[\s*$/.test(before);
    return before + (isEmptyArray ? '\n' : ',\n') + entry + '\n' + after;
}

function bindKeybinding(explicit) {
    const target = pickKeybindingTarget(explicit);
    const file = target.file;
    fs.mkdirSync(path.dirname(file), { recursive: true });
    let text = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : '';
    if (text.trim() && alreadyBound(text)) {
        log('[keybinding] ' + target.name + ': 已有 Alt+Enter 绑定，跳过');
        return;
    }
    if (text.trim()) {
        try { JSON.parse(stripJsonc(text)); } catch (e) {
            log('[keybinding] 现有配置无法解析，已跳过：' + e.message);
            log('[keybinding] 请手动在 VS Code 快捷键里绑定 Alt+Enter -> ' + ENTRY_TASK);
            return;
        }
        fs.writeFileSync(file + '.hydro.bak', text, 'utf8');
        log('[keybinding] 已备份原配置：' + file + '.hydro.bak');
    }
    fs.writeFileSync(file, insertEntry(text), 'utf8');
    log('[keybinding] ' + target.name + ': 已写入 Alt+Enter -> ' + ENTRY_TASK);
    log('[keybinding] VS Code 正在运行的话执行一下 Developer: Reload Window');
}

function portFree(port) {
    return new Promise(resolve => {
        const s = net.createServer();
        s.once('error', () => resolve(false));
        s.once('listening', () => s.close(() => resolve(true)));
        s.listen(port, '127.0.0.1');
    });
}

async function startTempServer(ws) {
    let port = 0;
    for (const p of [27124, 27125, 27126, 27127]) { if (await portFree(p)) { port = p; break; } }
    if (!port) return null;
    const child = spawn(process.execPath, [__filename, '--serve'], {
        cwd: ROOT,
        env: Object.assign({}, process.env, { PORT: String(port), HYDRO_WORKSPACE: ws || '' }),
        stdio: 'ignore',
        windowsHide: true
    });
    for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 150));
        if (!(await portFree(port))) return { port: port, child: child };
    }
    return { port: port, child: child };
}

function openUrl(url) {
    try {
        spawn('cmd', ['/c', 'start', '', url], { windowsHide: true, detached: true, stdio: 'ignore' }).unref();
    } catch (e) {
        log('打开浏览器失败，请手动访问 ' + url);
    }
}

function runtimeDir() {
    const base = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
    return path.join(base, 'HydroGodMode');
}

function bat(rows) { return rows.join('\r\n') + '\r\n'; }

function installRuntime(ws) {
    const dst = runtimeDir();
    fs.mkdirSync(dst, { recursive: true });
    fs.copyFileSync(__filename, path.join(dst, 'app.js'));
    fs.writeFileSync(path.join(dst, 'settings.json'), JSON.stringify({ workspace: ws || '', installedAt: new Date().toISOString() }, null, 2), 'utf8');
    fs.writeFileSync(path.join(dst, 'start.bat'), bat([
        '@echo off',
        'title Hydro-AtCoder-GodMode',
        'chcp 65001>nul',
        'cd /d "%~dp0"',
        'where node >nul 2>nul || (echo 未找到 Node.js，请先安装 https://nodejs.org & pause & exit /b 1)',
        'node "%~dp0app.js" --serve'
    ]), 'utf8');
    fs.writeFileSync(path.join(dst, 'uninstall.bat'), bat([
        '@echo off',
        'chcp 65001>nul',
        'setlocal',
        'for /f "tokens=5" %%a in (\'netstat -ano ^| findstr /r /c:":27122 .*LISTENING"\') do taskkill /f /pid %%a >nul 2>nul',
        'cd /d "%TEMP%"',
        'rmdir /s /q "%LOCALAPPDATA%\\HydroGodMode"',
        'echo 已卸载 Hydro-AtCoder-GodMode。',
        'pause'
    ]), 'utf8');
    fs.writeFileSync(path.join(dst, '.installed'), new Date().toISOString(), 'utf8');
    return dst;
}

function killPort(port) {
    spawnSync('powershell.exe', ['-NoProfile', '-Command',
        '$c = Get-NetTCPConnection -LocalPort ' + port + ' -State Listen -ErrorAction SilentlyContinue; foreach ($x in $c) { Stop-Process -Id $x.OwningProcess -Force -ErrorAction SilentlyContinue }'],
        { stdio: 'ignore' });
}

async function uninstall() {
    log('正在停止 ' + RUNTIME_PORT + ' 端口的服务…');
    killPort(RUNTIME_PORT);
    const dst = runtimeDir();
    if (fs.existsSync(dst)) {
        try { fs.rmSync(dst, { recursive: true, force: true }); log('已删除 ' + dst); }
        catch (e) { log('删除失败（服务可能仍在运行）：' + e.message); }
    } else {
        log('没有找到常驻安装目录，跳过。');
    }
    log('卸载完成。VS Code 里残留的 .vscode/tasks.json 与 Alt+Enter 绑定请手动删除。');
}

async function installerMain() {
    if (flag('uninstall')) return uninstall();

    let ws = args.find(a => !a.startsWith('--')) || process.env.HYDRO_WS || '';
    if (ws) {
        ws = ws.replace(/^"|"$/g, '').trim();
        log('工作区：' + ws);
        if (!fs.existsSync(ws)) { log('目录不存在：' + ws); process.exitCode = 1; return; }
    } else {
        ws = await chooseWorkspace();
        if (!ws) { log('没有选择工作区，安装取消。'); process.exitCode = 1; return; }
    }
    setupWorkspace(ws);

    if (!flag('no-keybind') && !envFlag('NO_KEYBIND')) bindKeybinding();

    const srv = await startTempServer(ws);
    if (srv) {
        const url = 'http://localhost:' + srv.port + '/install.html';
        log('');
        log('临时服务已启动：' + url);
        if (!flag('no-browser') && !envFlag('NO_BROWSER')) openUrl(url);
        else log('请手动用浏览器打开上面的地址。');
        blank();
        await pause('按回车继续（会先装好上面页面里的篡改猴脚本，再回来按回车）…');
        try { srv.child.kill(); } catch (e) { /* 忽略 */ }
    } else {
        log('没有可用端口起临时服务，跳过脚本安装页面。');
    }

    let keep = flag('keep-runtime') || envFlag('KEEP_RUNTIME');
    if (!keep && !flag('no-runtime')) {
        const answer = await readlineOnce('是否安装常驻服务（占用 27122 端口，双击 start.bat 即可启动）？[Y/n] ');
        keep = !/^n/i.test(answer);
    }
    if (keep) {
        const dst = installRuntime(ws);
        log('常驻服务已安装：' + dst);
        log('以后双击 ' + path.join(dst, 'start.bat') + ' 启动；卸载请运行 ' + path.join(dst, 'uninstall.bat') + ' 或 app.js --uninstall。');
    } else {
        log('未安装常驻服务，下次使用请重新运行本安装器（临时服务只在安装期间存在）。');
    }

    blank();
    log('安装完成！');
    log('1. 用 VS Code 打开工作区：' + ws);
    log('2. 常驻服务在跑时，Alt+Enter 提交代码');
    blank();
    await pause('按回车关闭…');
}


// 工作区：环境变量 > 安装时写下的 settings.json > 本文件所在目录
function workspaceDir() {
    if (process.env.HYDRO_WORKSPACE) return process.env.HYDRO_WORKSPACE;
    try {
        const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'settings.json'), 'utf8'));
        if (cfg.workspace && fs.existsSync(cfg.workspace)) return cfg.workspace;
    } catch (e) { /* 没有配置文件就用默认 */ }
    return ROOT;
}

function startServer() {
    const WATCH_DIR = workspaceDir();
    const PORT = Number(process.env.PORT) || 27122;
    const HOST = '127.0.0.1';            // 只监听本机，避免局域网/其它设备访问这个无鉴权接口
    const CTX_TTL = 30 * 60 * 1000;      // 题目上下文有效期：30 分钟内有效
    const MAX_POLLS = 25;                // 轮询评测结果次数（约 25 秒）
    const FALLBACK_LANG = 'cc.cc17';
    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';
    
    // 每个题目页最近一次同步的上下文。<url, {at,cookie,lang,langs,csrf,title}>
    // 用 Map 而不是单个全局变量，避免开了多个题目标签页时提交到错误的那一题。
    const contexts = new Map();
    let lastMarkdown = '';
    let syncTimer = null;
    
    function pruneContexts() {
        const now = Date.now();
        for (const [k, v] of contexts) if (now - v.at > CTX_TTL) contexts.delete(k);
    }
    
    function latestContext() {
        pruneContexts();
        let best = null;
        for (const v of contexts.values()) if (!best || v.at > best.at) best = v;
        return best;
    }
    
    function pickLang(langs, wanted) {
        const list = (langs || []).map(String).filter(Boolean);
        if (!list.length) return wanted || FALLBACK_LANG;
        if (wanted && list.includes(wanted)) return wanted;
        const find = re => list.find(v => re.test(v));
        return find(/^cc\..*(17|std17)/i) || find(/^cc\./i) || find(/cpp|c\+\+/i) || list[0];
    }
    
    function problemId(url) {
        try {
            const m = new URL(url).pathname.match(/\/(?:p|problem)\/([^/]+)\/?$/);
            return m ? decodeURIComponent(m[1]) : '';
        } catch (e) { return ''; }
    }
    
    // 优先提交与题号同名的 .cpp（如 P1001.cpp / P1001_暴力.cpp），找不到再退回“最新修改的文件”
    function getLatestCpp(pid, title) {
        try {
            const files = fs.readdirSync(WATCH_DIR).filter(f => f.toLowerCase().endsWith('.cpp'));
            if (!files.length) return null;
            const list = files.map(f => {
                const p = path.join(WATCH_DIR, f);
                return { path: p, name: f, mtime: fs.statSync(p).mtimeMs };
            }).sort((a, b) => b.mtime - a.mtime);
    
            const keys = [pid, pid && ('p' + pid), title]
                .filter(Boolean)
                .map(s => String(s).toLowerCase().replace(/\s+/g, '').replace(/\.cpp$/, ''));
            const hit = keys.length ? list.find(x => {
                const n = x.name.toLowerCase().replace(/\.cpp$/, '').replace(/\s+/g, '');
                return keys.some(k => n === k || n.startsWith(k + '_') || n.startsWith(k + '-') || n === k.replace(/[^a-z0-9]/g, ''));
            }) : null;
            const chosen = hit || list[0];
            return { path: chosen.path, code: fs.readFileSync(chosen.path, 'utf-8'), matchedByProblem: !!hit };
        } catch (e) { return null; }
    }
    
    // 静态资源全部内嵌在本文件，用内存返回（篡改猴只认 http(s) 的 .user.js 链接）
    function serveAsset(req, res) {
        let urlPath;
        try { urlPath = decodeURIComponent(req.url.split('?')[0]); } catch (e) { return false; }
        if (urlPath === '/' || urlPath === '/install' || urlPath === '/install/') {
            res.writeHead(302, { Location: '/install.html' });
            res.end();
            return true;
        }
        const key = urlPath.replace(/^\/+/, '');
        const wantDownload = /[?&]download=1/.test(req.url);
        const body = ASSETS[key];
        if (body === undefined) return false;
        res.writeHead(200, {
            'Content-Type': key.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/javascript; charset=utf-8',
            'Cache-Control': 'no-store',
            ...(wantDownload && key.endsWith('.user.js') ? { 'Content-Disposition': 'attachment; filename="' + key.split('/').pop() + '"' } : {})
        });
        if (req.method === 'HEAD') { res.end(); return true; }
        res.end(body);
        return true;
    }
    
    function readJson(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', c => { body += c; if (body.length > 4 * 1024 * 1024) reject(new Error('too large')); });
            req.on('end', () => { try { resolve(JSON.parse(body || '{}')); } catch (e) { reject(e); } });
            req.on('error', reject);
        });
    }
    
    // --- /api/sync：浏览器脚本把当前题目的上下文发过来 ---
    function handleSync(req, res) {
        readJson(req).then(data => {
            const url = String(data.url || '');
            if (!url) { res.writeHead(400); res.end('missing url'); return; }
    
            const prev = contexts.get(url);
            const ctx = {
                at: Date.now(),
                url,
                cookie: data.cookie || (prev && prev.cookie) || '',
                lang: data.lang || (prev && prev.lang) || '',
                langs: Array.isArray(data.langs) ? data.langs.slice(0, 200) : ((prev && prev.langs) || []),
                csrf: data.csrf || (prev && prev.csrf) || '',
                title: data.title || (prev && prev.title) || ''
            };
            contexts.set(url, ctx);
    
            const host = (() => { try { return new URL(url).host; } catch (e) { return '?'; } })();
            console.log('[server] synced ' + host + (ctx.title ? ' | ' + ctx.title : '') +
                ' | lang=' + (ctx.lang || 'auto') + (ctx.csrf ? ' | csrf=ok' : '') +
                ' | ' + contexts.size + ' problem(s) cached');
    
            if (data.markdown && data.markdown !== lastMarkdown) {
                lastMarkdown = data.markdown;
                if (syncTimer) clearTimeout(syncTimer);
                syncTimer = setTimeout(() => writeProblemMarkdown(data.markdown), 400);
            }
            res.writeHead(200); res.end('ok');
        }).catch(e => { res.writeHead(400); res.end('bad request: ' + e.message); });
    }
    
    function writeProblemMarkdown(markdown) {
        const mdPath = path.join(WATCH_DIR, 'Problem.md');
        try { fs.writeFileSync(mdPath, markdown, 'utf-8'); } catch (e) { console.error('[server] 写入 Problem.md 失败', e.message); return; }
        const latest = getLatestCpp();
        const files = latest ? '"' + latest.path + '" "' + mdPath + '"' : '"' + mdPath + '"';
        exec('code -r ' + files, { cwd: WATCH_DIR }, err => {
            if (err) console.error('[server] 无法调用 VSCode 的 code 命令（可在 VSCode 里执行 Shell Command: Install code command in PATH）：' + err.message);
        });
    }
    
    function parseRecordUrl(locationHeader, submitUrl) {
        if (!locationHeader) return '';
        try { return new URL(locationHeader, submitUrl).href; } catch (e) { return ''; }
    }
    
    function findRidInBody(body, submitUrl) {
        const m = body.match(/"rid"\s*:\s*"?(\d+)/) ||
                  body.match(/\/record\/(\d+)/) ||
                  body.match(/record\/(\d{6,})/);
        if (!m) return '';
        try { return new URL('/record/' + m[1], submitUrl).href; } catch (e) { return ''; }
    }
    
    function extractStatus(html) {
        const sm = html.match(/id="status"[^>]*data-status="(\d+)"/) || html.match(/data-status="(\d+)"/);
        if (!sm) return null;
        const score = (html.match(/<span style="color: #[0-9a-fA-F]+">(\d+)<\/span>/) || [])[1] || '?';
        const text = (html.match(/<span class="record-status--text[^"]*">\s*([^<]+)\s*<\/span>/) || [])[1];
        return { status: parseInt(sm[1], 10), score, text: text ? text.trim() : 'Unknown' };
    }
    
    // --- /api/submit：Alt+Enter 触发，取出最近同步的那道题并提交 ---
    function handleSubmit(req, res) {
        let finished = false;
        const reply = (code, text) => {
            if (finished) return;
            finished = true;
            res.writeHead(code, { 'Content-Type': 'text/plain; charset=utf-8' });
            res.end(text);
        };
    
        const ctx = latestContext();
        if (!ctx) {
            reply(400, '❌ 还没有任何题目上下文，请先在题目页点一次「发送到 CPH」按钮\n');
            return;
        }
        if (!ctx.cookie) {
            reply(400, '❌ 没拿到 Cookie，请确认已在题目站点登录，再点一次抓题按钮\n');
            return;
        }
    
        let origin = '', submitUrl = '';
        try {
            const u = new URL(ctx.url);
            origin = u.origin;
            const pathname = u.pathname.replace(/\/$/, '');
            if (!/\/(p|problem)\/[^/]+$/.test(pathname)) {
                reply(400, '❌ 当前题目 URL 不是标准 Hydro 题目页（/p/<id>）：' + pathname + '\n');
                return;
            }
            submitUrl = origin + pathname + '/submit' + u.search;
        } catch (e) {
            reply(400, '❌ 题目 URL 解析失败\n');
            return;
        }
    
        const pid = problemId(ctx.url);
        const latest = getLatestCpp(pid, ctx.title);
        if (!latest) {
            reply(400, '❌ 工作目录下没找到 .cpp 文件：' + WATCH_DIR + '\n');
            return;
        }
    
        const lang = pickLang(ctx.langs, ctx.lang);
        console.log('[server] submit target: ' + submitUrl);
        console.log('[server] file: ' + path.basename(latest.path) + (latest.matchedByProblem ? ' (与题号匹配)' : ' (最新修改)') + ' | lang=' + lang);
    
        const formData = new FormData();
        formData.append('lang', lang);
        formData.append('code', latest.code);
        if (ctx.csrf) formData.append('_csrf', ctx.csrf);
    
        const headers = {
            'Cookie': ctx.cookie,
            'Referer': ctx.url,
            'Origin': origin,
            'User-Agent': UA,
            'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8'
        };
    
        fetch(submitUrl, { method: 'POST', headers, body: formData, redirect: 'manual' })
            .then(async r => {
                // 302/303 时 Location 就是记录页；也兼容直接渲染 HTML / 返回 JSON 的版本
                let recordUrl = parseRecordUrl(r.headers.get('location'), submitUrl);
                if (!recordUrl) {
                    const body = await r.text();
                    recordUrl = findRidInBody(body, submitUrl) || r.url || '';
                    if (!r.ok && r.status !== 200 && r.status !== 201 && r.status !== 302 && r.status !== 303) {
                        throw new Error('提交被拒绝，HTTP ' + r.status + '（若站点开启了 CSRF 防护，请回题目页重新点一次抓题按钮）');
                    }
                }
                if (!recordUrl) throw new Error('提交后无法确定记录页地址');
    
                console.log('[server] submitted, record: ' + recordUrl);
    
                const startedAt = Date.now();
                const checkStatus = async (n) => {
                    if (n >= MAX_POLLS) {
                        reply(200, '⚠️ 还没评测完（已等 ' + Math.round((Date.now() - startedAt) / 1000) + 's），记录页：\n' + recordUrl + '\n');
                        return;
                    }
                    try {
                        const rr = await fetch(recordUrl, { headers: { 'Cookie': ctx.cookie, 'User-Agent': UA, 'Referer': ctx.url } });
                        const info = extractStatus(await rr.text());
                        if (!info) {
                            if (n > 6) { reply(200, '⚠️ 记录页读不到状态（可能需要登录/竞赛未结束），记录页：\n' + recordUrl + '\n'); return; }
                            setTimeout(() => checkStatus(n + 1), 1000);
                            return;
                        }
                        if ([1, 2, 3, 4, 5, 6, 7].includes(info.status)) {
                            const icon = info.status === 1 ? '✅' : (info.status === 2 ? '❌' : '⚠️');
                            reply(200, icon + ' ' + info.text + ' | 得分: ' + info.score + ' | 详情: ' + recordUrl + '\n');
                            return;
                        }
                        if (n % 3 === 0) console.log('[server] judging...');
                        setTimeout(() => checkStatus(n + 1), 1000);
                    } catch (e) {
                        setTimeout(() => checkStatus(n + 1), 1000);
                    }
                };
                checkStatus(0);
            })
            .catch(err => reply(500, '❌ 提交出错: ' + err.message + '\n'));
    }
    
    // --- /api/ping：篡改猴脚本启动时打个心跳，确认脚本在某个站点到底有没有跑起来 ---
    let lastPing = null;
    function handlePing(req, res) {
        readJson(req).then(data => {
            lastPing = {
                at: Date.now(),
                url: String(data.url || ''),
                title: String(data.title || ''),
                host: String(data.host || ''),
                version: String(data.version || '')
            };
            console.log('[server] 心跳 ' + (lastPing.host || '?') + ' v' + (lastPing.version || '?') + (lastPing.title ? ' | ' + lastPing.title : ''));
            res.writeHead(200); res.end('ok');
        }).catch(e => { res.writeHead(400); res.end('bad ping: ' + e.message); });
    }
    function handlePingStatus(req, res) {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
        res.end(JSON.stringify({ ok: true, now: Date.now(), ping: lastPing }));
    }
    
    const server = http.createServer((req, res) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS');
        if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
    
        if ((req.method === 'GET' || req.method === 'HEAD') && serveAsset(req, res)) return;
    
        if (req.method === 'POST' && req.url.split('?')[0] === '/api/sync') { handleSync(req, res); return; }
        if (req.method === 'POST' && req.url.split('?')[0] === '/api/submit') { handleSubmit(req, res); return; }
        if (req.method === 'POST' && req.url.split('?')[0] === '/api/ping') { handlePing(req, res); return; }
        if (req.method === 'GET' && req.url.split('?')[0] === '/api/ping') { handlePingStatus(req, res); return; }
    
        res.writeHead(404);
        res.end('Not found');
    });
    
    server.listen(PORT, HOST, () => {
        console.log('Server: http://localhost:' + PORT + '/install.html  (local only)');
    });
}

if (process.argv.includes('--serve')) {
    startServer();
} else {
    installerMain().catch(e => {
        console.error('安装失败：' + (e && e.message ? e.message : e));
        process.exitCode = 1;
    });
}
