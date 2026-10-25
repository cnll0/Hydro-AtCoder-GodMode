// ==UserScript==
// @name         可达信奥 (Hydro) 全能助手
// @namespace    http://tampermonkey.net/
// @version      7.4
// @description  抓取样例到CPH，并同步Cookie、URL和带样例的Markdown题面到本地Server
// @author       You
// @match        https://kedaoi.cn/*
// @match        https://*.kedaoi.cn/*
// @match        https://kedaoi.com/*
// @match        https://*.kedaoi.com/*
// @grant        GM_xmlhttpRequest
// @connect      localhost
// @connect      kedaoi.cn
// ==/UserScript==

(function () {
    'use strict';

    const pageType = document.documentElement.dataset.page;
    const isProblemPage = pageType.includes('problem') && !pageType.includes('submit');
    if (!isProblemPage) return;

    const MAX_INPUT_BYTES  = 5 * 1024 * 1024;
    const MAX_OUTPUT_BYTES = 5 * 1024 * 1024;
    const MAX_TESTS        = 0;
    const SYNC_SERVER_URL  = 'http://localhost:27122/api/sync';
    const log = (...a) => console.log('[全能助手]', ...a);

    const btn = document.createElement('button');
    btn.textContent = '发送到 CPH';
    Object.assign(btn.style, {
        position: 'fixed', bottom: '100px', right: '20px', zIndex: 9999,
        padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white',
        border: 'none', borderRadius: '5px', cursor: 'pointer',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)', fontSize: '14px'
    });
    document.body.appendChild(btn);

    let abort = false, running = false;

    btn.addEventListener('click', async () => {
        if (running) { abort = true; setStatus('正在停止...', '#FF9800'); return; }
        abort = false; running = true; setStatus('处理中...', '#FFA500');
        syncToServer();
        try {
            const data = await collectProblemData();
            if (abort) { setStatus('已取消', '#9E9E9E'); return; }
            if (!data || data.tests.length === 0) {
                setStatus('未找到样例', '#f44336');
            } else {
                setStatus(`发送 ${data.tests.length} 组...`, '#FFA500');
                await sendToCPH(data);
                setStatus(`已发送 ${data.tests.length} 组`, '#4CAF50');
            }
        } catch (e) {
            console.error(e); setStatus('错误: ' + e.message, '#f44336');
        } finally {
            running = false;
            setTimeout(() => { if (!running) setStatus('发送到 CPH', '#4CAF50'); }, 3000);
        }
    });

    function setStatus(text, color) { btn.textContent = text; btn.style.backgroundColor = color; }

    function syncToServer() {
        let url = location.href;
        if (url.includes('/submit')) url = url.split('/submit')[0] + (location.search || '');
        let problemMarkdown = '';
        try {
            const uiContext = JSON.parse(window.UiContextNew || '{}');
            if (uiContext.pdoc && uiContext.pdoc.content) {
                let raw = uiContext.pdoc.content;
                if (typeof raw === 'string' && raw.trim().startsWith('{')) {
                    try {
                        const parsed = JSON.parse(raw);
                        raw = parsed.zh || parsed.en || Object.values(parsed)[0] || raw;
                    } catch (e) {}
                }
                problemMarkdown = raw;
            }
        } catch (e) {}

        if (!problemMarkdown) {
            const descDiv = document.querySelector('.problem-content');
            if (descDiv) {
                const clone = descDiv.cloneNode(true);
                clone.querySelectorAll('.section__header, .div-btn-copy, .split-line, .toolbar').forEach(el => el.remove());
                problemMarkdown = clone.innerHTML || clone.textContent;
            }
        }
        if (problemMarkdown) {
            problemMarkdown = problemMarkdown.replace(/<!--[\s\S]*?-->/g, '')
                                           .replace(/(?:Copy|填充到自测)/g, '')
                                           .replace(/\n{3,}/g, '\n\n')
                                           .trim();
        }

        GM_xmlhttpRequest({
            method: 'POST', url: SYNC_SERVER_URL,
            headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ cookie: document.cookie, url: url, markdown: problemMarkdown })
        });
    }

    function checkAbort() { if (abort) throw new Error('用户取消'); }
    function normalize(s) { return s.replace(/\r\n/g, '\n').replace(/[ \t]+$/gm, '').replace(/^\n+|\n+$/g, ''); }
    function dedupe(tests) {
        const seen = new Set(), out = [];
        for (const t of tests) {
            const key = normalize(t.input) + '\u0000' + normalize(t.output);
            if (!seen.has(key)) { seen.add(key); out.push(t); }
        }
        return out;
    }

    async function collectProblemData() {
        let problemName = '', timeLimit = 1000, memoryLimit = 256;
        try {
            const uiContext = JSON.parse(window.UiContextNew || '{}');
            if (uiContext.pdoc) {
                problemName = uiContext.pdoc.title || '';
                const cfg = uiContext.pdoc.config || {};
                timeLimit = cfg.timeMin || timeLimit; memoryLimit = cfg.memoryMin || memoryLimit;
            }
        } catch (e) {}
        if (!problemName) {
            const h1s = document.querySelectorAll('h1.section__title');
            for (const h of h1s) {
                const t = h.textContent.trim();
                if (t && !/^递交|^题目详情/.test(t)) { problemName = t; break; }
            }
        }
        if (!problemName) problemName = document.title;
        problemName = problemName.replace(/^\d+\s+/, '').replace(/^#?[A-Z]*\d+\.\s*/, '').replace(/^[A-Z]\.\s*/, '').trim();

        const tests = [];
        const inputs = [...document.querySelectorAll('pre > code[class*="language-input"]')];
        const outputs = [...document.querySelectorAll('pre > code[class*="language-output"]')];
        const len = Math.min(inputs.length, outputs.length);
        for (let i = 0; i < len; i++) tests.push({ input: inputs[i].textContent, output: outputs[i].textContent });
        checkAbort();

        const zipUrl = findExtraZipUrl();
        if (zipUrl) {
            const extra = await downloadAndParseZip(zipUrl);
            tests.push(...extra);
        }

        return {
            name: problemName, group: '可达信奥', url: location.href, interactive: false,
            memoryLimit, timeLimit, tests: dedupe(tests), testType: 'single',
            input: { type: 'stdin' }, output: { type: 'stdout' }, languages: { cpp: { compiler: 'g++' } }
        };
    }

    function findExtraZipUrl() {
        const headers = document.querySelectorAll('h1, h2, h3');
        for (const h of headers) {
            if (/额外样例|样例下载|样例文件|附件下载|大小样例|样例包|附加样例|下载样例/.test(h.textContent)) {
                let node = h.nextElementSibling;
                while (node && !/^H[1-3]$/.test(node.tagName)) {
                    const a = node.querySelector?.('a[href*=".zip"]') || (node.tagName === 'A' && node.href.includes('.zip') ? node : null);
                    if (a) return a.href;
                    node = node.nextElementSibling;
                }
            }
        }
        for (const a of document.querySelectorAll('a[href*=".zip"]')) if (/样例|sample|extra|附件|下载/i.test(a.textContent)) return a.href;
        return null;
    }

    async function downloadAndParseZip(url) {
        const resp = await fetch(url, { credentials: 'include' });
        const buf = await resp.arrayBuffer();
        const unzipped = await unzipNative(buf);
        const decoder = new TextDecoder('utf-8'), files = {};
        for (const [path, data] of Object.entries(unzipped)) {
            const name = path.split('/').pop().toLowerCase();
            if (/\.(in|ans|out)$/.test(name) && data.length <= (/\.in$/.test(name) ? MAX_INPUT_BYTES : MAX_OUTPUT_BYTES)) files[name] = decoder.decode(data);
        }
        const tests = [], inKeys = Object.keys(files).filter(k => k.endsWith('.in')).sort();
        for (const inKey of inKeys) {
            const base = inKey.slice(0, -3);
            const ansKey = files[base + '.ans'] ? base + '.ans' : (files[base + '.out'] ? base + '.out' : null);
            if (ansKey) tests.push({ input: files[inKey], output: files[ansKey] });
        }
        return tests;
    }

    async function unzipNative(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        let eocd = -1;
        for (let i = arrayBuffer.byteLength - 22; i >= 0; i--) if (view.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
        if (eocd < 0) return {};
        const cdCount = view.getUint16(eocd + 10, true), cdOffset = view.getUint32(eocd + 16, true), result = {};
        let p = cdOffset;
        for (let i = 0; i < cdCount; i++) {
            const method = view.getUint16(p + 10, true), compSize = view.getUint32(p + 20, true), nameLen = view.getUint16(p + 28, true);
            const extraLen = view.getUint16(p + 30, true), commentLen = view.getUint16(p + 32, true), localOffset = view.getUint32(p + 42, true);
            const name = new TextDecoder('utf-8').decode(new Uint8Array(arrayBuffer, p + 46, nameLen));
            const dataStart = localOffset + 30 + view.getUint16(localOffset + 26, true) + view.getUint16(localOffset + 28, true);
            const compData = new Uint8Array(arrayBuffer, dataStart, compSize);
            if (method === 0) result[name] = compData;
            else if (method === 8) {
                const ds = new DecompressionStream('deflate-raw'), writer = ds.writable.getWriter();
                writer.write(compData); writer.close();
                const chunks = [], reader = ds.readable.getReader();
                while (true) { const { done, value } = await reader.read(); if (done) break; chunks.push(value); }
                const out = new Uint8Array(chunks.reduce((acc, c) => acc + c.length, 0));
                let off = 0; for (const c of chunks) { out.set(c, off); off += c.length; }
                result[name] = out;
            }
            p += 46 + nameLen + extraLen + commentLen;
        }
        return result;
    }

    function sendToCPH(data) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST', url: 'http://localhost:27121', headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(data),
                onload: r => (r.status === 200 || r.status === 0) ? resolve() : reject(new Error('CPH Error')),
                onerror: () => reject(new Error('CPH 未运行'))
            });
        });
    }
})();