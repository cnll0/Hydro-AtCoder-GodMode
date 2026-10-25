// ==UserScript==
// @name         AtCoder Plus (CPH & VSCode Sync)
// @namespace    http://tampermonkey.net/
// @version      8.0
// @description  抓取样例到CPH，并同步Cookie、URL和题面到本地Server
// @author       You
// @match        https://atcoder.jp/contests/*/tasks/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @connect      localhost
// @connect      127.0.0.1
// ==/UserScript==

(function () {
    'use strict';
    const SYNC_SERVER_URL = 'http://localhost:27122/api/sync', CPH_PORT = 27121;

    GM_addStyle(`
        #cgh-to-cph-btn { position: fixed; top: 15px; right: 20px; z-index: 9999; padding: 10px 16px; background: #00bcd4; color: white; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.2); transition: all 0.2s; }
        #cgh-to-cph-btn:hover { background: #008ba3; transform: translateY(-2px); }
    `);

    const btn = document.createElement('button');
    btn.id = 'cgh-to-cph-btn'; btn.textContent = '🚀 传送至 CPH / VSCode';
    document.body.appendChild(btn);

    btn.addEventListener('click', async () => {
        try {
            btn.textContent = '⏳ 处理中...'; btn.style.background = '#ff9800';
            syncToServer();
            const data = await getData();
            if (data.tests.length === 0) { alert('未找到样例。'); return; }
            await sendToCPH(data);
            btn.textContent = '✅ 已发送'; btn.style.background = '#4caf50';
        } catch (e) {
            btn.textContent = '❌ 发送失败'; btn.style.background = '#f44336';
        } finally {
            setTimeout(() => { btn.textContent = '🚀 传送至 CPH / VSCode'; btn.style.background = '#00bcd4'; }, 3000);
        }
    });

    function syncToServer() {
        let markdown = '';
        const statementSpan = document.querySelector('span.lang-en') || document.querySelector('span.lang-ja');
        if (statementSpan) {
            const clone = statementSpan.cloneNode(true);
            clone.querySelectorAll('div.part > section').forEach(sec => {
                const h3 = sec.querySelector('h3');
                if (h3 && h3.textContent.includes('Sample')) sec.remove();
            });
            clone.querySelectorAll('.div-btn-copy, hr').forEach(el => el.remove());
            markdown = clone.innerHTML;
        }
        GM_xmlhttpRequest({
            method: 'POST', url: SYNC_SERVER_URL, headers: { 'Content-Type': 'application/json' },
            data: JSON.stringify({ cookie: document.cookie, url: location.href, markdown: markdown })
        });
    }

    async function getData() {
        const pathParts = window.location.pathname.split('/');
        const contestId = pathParts[2], problemId = pathParts[4];
        let timeLimit = 2000, memoryLimit = 1024;
        const infoNode = document.querySelector('#main-container p');
        if (infoNode) {
            const text = infoNode.textContent;
            const timeMatch = text.match(/Time Limit:\s*(\d+)\s*sec/i), memMatch = text.match(/Memory Limit:\s*(\d+)\s*MB/i);
            if (timeMatch) timeLimit = parseInt(timeMatch[1]) * 1000;
            if (memMatch) memoryLimit = parseInt(memMatch[1]);
        }
        let preNodes = document.querySelectorAll('span.lang-en > div.part > section > pre');
        if (preNodes.length === 0) preNodes = document.querySelectorAll('span.lang-ja > div.part > section > pre');
        const tests = [];
        for (let i = 0; i < preNodes.length; i += 2) {
            if (preNodes[i] && preNodes[i+1]) {
                tests.push({ input: preNodes[i].textContent.trim(), output: preNodes[i+1].textContent.trim() });
            }
        }
        return {
            name: contestId.replace(/\d+/g, '').toUpperCase() + " " + (contestId.match(/\d+/g) || [''])[0] + " " + problemId.split('_').pop().toUpperCase(),
            group: contestId.replace(/\d+/g, '').toUpperCase(), url: window.location.href,
            interactive: false, memoryLimit, timeLimit, tests, testType: "single",
            input: { type: "stdin" }, output: { type: "stdout" }, languages: { cpp: { compiler: 'g++' } }
        };
    }

    function sendToCPH(data) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'POST', url: `http://localhost:${CPH_PORT}/`, headers: { 'Content-Type': 'application/json' },
                data: JSON.stringify(data),
                onload: r => (r.status === 200 || r.status === 0) ? resolve() : reject(new Error('CPH Error')),
                onerror: () => reject(new Error('CPH 未运行'))
            });
        });
    }
})();