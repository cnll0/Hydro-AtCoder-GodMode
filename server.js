const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const WATCH_DIR = __dirname; 
const PORT = Number(process.env.PORT) || 27122;

let browserCookie = '';
let currentProblemUrl = '';
let lastMarkdown = '';
let syncTimer = null;

function getLatestCpp() {
    try {
        const files = fs.readdirSync(WATCH_DIR).filter(f => f.endsWith('.cpp'));
        if (files.length === 0) return null;
        let newest = null, newestTime = 0;
        for (const f of files) {
            const p = path.join(WATCH_DIR, f);
            const stat = fs.statSync(p);
            if (stat.mtimeMs > newestTime) { newestTime = stat.mtimeMs; newest = p; }
        }
        return newest ? { path: newest, code: fs.readFileSync(newest, 'utf-8') } : null;
    } catch (e) { return null; }
}

const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/markdown; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

// 托管安装页与用户脚本：篡改猴只能通过 http(s) 的 .user.js 链接弹出安装框，
// file:// 直接打开只会显示源码，所以必须由本地服务提供这些文件。
function serveStatic(req, res) {
    let urlPath;
    try { urlPath = decodeURIComponent(req.url.split('?')[0]); } catch (e) { return false; }

    if (urlPath === '/' || urlPath === '/install' || urlPath === '/install/') {
        res.writeHead(302, { Location: '/install.html' });
        res.end();
        return true;
    }

    if (!/^\/(install\.html|README\.md|INSTALL\.md|tampermonkey\/[\w.\-]+)$/.test(urlPath)) return false;

    const filePath = path.normalize(path.join(WATCH_DIR, urlPath));
    if (filePath !== WATCH_DIR && !filePath.startsWith(WATCH_DIR + path.sep)) return false;

    fs.stat(filePath, (err, stat) => {
        if (err || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, {
            'Content-Type': MIME[ext] || 'application/octet-stream',
            // 关键：.user.js 用 application/javascript 返回，篡改猴会拦截并弹出安装确认
            'Cache-Control': 'no-store'
        });
        if (req.method === 'HEAD') { res.end(); return; }
        fs.createReadStream(filePath).pipe(res);
    });
    return true;
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

    if ((req.method === 'GET' || req.method === 'HEAD') && serveStatic(req, res)) return;

    if (req.method === 'POST' && req.url === '/api/sync') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                browserCookie = data.cookie || browserCookie;
                
                if (data.url && data.url !== currentProblemUrl) {
                    currentProblemUrl = data.url;
                    const tidMatch = currentProblemUrl.match(/tid=([^&]+)/);
                    const tid = tidMatch ? `[比赛ID: ${tidMatch[1]}]` : '';
                    console.log(`\n[server] 🔄 已更新提交目标: ${currentProblemUrl.split('?')[0]} ${tid}`);
                }

                if (data.markdown) {
                    if (data.markdown === lastMarkdown) {
                        res.writeHead(200); res.end('ok');
                        return;
                    }
                    lastMarkdown = data.markdown;

                    if (syncTimer) clearTimeout(syncTimer);
                    syncTimer = setTimeout(() => {
                        const mdPath = path.join(WATCH_DIR, 'Problem.md');
                        fs.writeFileSync(mdPath, data.markdown, 'utf-8');
                        
                        const latest = getLatestCpp();
                        if (latest) {
                            const cmd = `code -r "${latest.path}" "${mdPath}"`;
                            exec(cmd, (err) => { if (err) console.error(err); });
                        } else {
                            exec(`code -r "${mdPath}"`, (err) => { if (err) console.error(err); });
                        }
                    }, 500);
                    
                    res.writeHead(200); res.end('ok');
                } else {
                    res.writeHead(200); res.end('ok');
                }
            } catch (e) { res.writeHead(400); res.end('bad json'); }
        });
        return;
    }

    if (req.method === 'POST' && req.url === '/api/submit') {
        if (!browserCookie || !currentProblemUrl) {
            res.writeHead(400); res.end('❌ 缺少 Cookie 或 URL，请去浏览器点一次抓题\n');
            return;
        }
        const latest = getLatestCpp();
        if (!latest) {
            res.writeHead(400); res.end('❌ 目录下没找到 .cpp 文件\n');
            return;
        }
        
        console.log(`[server] 📄 读取到代码: ${path.basename(latest.path)}`);

        let submitUrl = '';
        if (currentProblemUrl.includes('/p/')) {
            const baseUrl = currentProblemUrl.split('?')[0];
            const query = currentProblemUrl.includes('?') ? currentProblemUrl.substring(currentProblemUrl.indexOf('?')) : '';
            submitUrl = baseUrl.replace(/\/$/, '') + '/submit' + query;
        } else {
            res.writeHead(400); res.end('❌ URL格式不支持\n'); return;
        }

        console.log(`[server] ⏳ 正在提交到: ${submitUrl}`);

        const formData = new FormData();
        formData.append('lang', 'cc.std17');
        formData.append('code', latest.code);

        fetch(submitUrl, {
            method: 'POST', headers: { 'Cookie': browserCookie }, body: formData
        }).then(async r => {
            const recordUrl = r.url; 
            if (!r.ok && !r.redirected) throw new Error('提交失败，HTTP ' + r.status);
            
            console.log(`[server] 🚀 提交成功，记录页: ${recordUrl}`);
            console.log(`[server] ⌛ 正在检测结果 (最多等待8秒)...`);

            let pollCount = 0;
            const maxPolls = 8;
            
            const checkStatus = async () => {
                if (pollCount++ >= maxPolls) {
                    console.log(`\n[server] ⚠️ 未立即公布结果 (OI赛制/评测中)。详情: ${recordUrl}\n`);
                    res.writeHead(200); res.end(`⚠️ 未公布结果:\n${recordUrl}\n`);
                    return;
                }
                try {
                    const recordRes = await fetch(recordUrl, { headers: { 'Cookie': browserCookie } });
                    const html = await recordRes.text();
                    const statusMatch = html.match(/<div class="section[^"]*" id="status" data-status="(\d+)">/);
                    
                    if (statusMatch) {
                        const status = parseInt(statusMatch[1]);
                        if ([1, 2, 3, 4, 5, 6, 7].includes(status)) {
                            const scoreMatch = html.match(/<span style="color: #[0-9a-fA-F]+">(\d+)<\/span>/);
                            const score = scoreMatch ? scoreMatch[1] : '?';
                            const textMatch = html.match(/<span class="record-status--text[^"]*">\s*([^<]+)\s*<\/span>/);
                            const statusText = textMatch ? textMatch[1].trim() : 'Unknown';
                            
                            let icon = status === 1 ? '✅' : (status === 2 ? '❌' : '⚠️');
                            const finalOut = `${icon} ${statusText} | 得分: ${score} | 详情: ${recordUrl}`;
                            console.log(`\n========================================\n[server] ${finalOut}\n========================================\n`);
                            res.writeHead(200); res.end(finalOut + '\n');
                            return;
                        } else {
                            if (pollCount % 2 === 1) console.log(`[server] ⏳ 评测中...`);
                            setTimeout(checkStatus, 1000);
                            return;
                        }
                    } else {
                        if (pollCount > 3) {
                            console.log(`\n[server] ⚠️ 状态被隐藏。详情: ${recordUrl}\n`);
                            res.writeHead(200); res.end(`⚠️ 状态隐藏:\n${recordUrl}\n`);
                            return;
                        }
                        setTimeout(checkStatus, 1000);
                    }
                } catch (e) {
                    setTimeout(checkStatus, 1000);
                }
            };
            checkStatus();
        }).catch(err => {
            res.writeHead(500); res.end('❌ 提交出错: ' + err.message + '\n');
        });
        return;
    }
    res.writeHead(404); res.end();
});

server.listen(PORT, () => {
    console.log(`\n🚀 Server 运行在 http://localhost:${PORT}\n`);
});