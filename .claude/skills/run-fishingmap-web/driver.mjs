#!/usr/bin/env node
// Headless-Chromium driver for fishingmap.web, used because `chromium-cli` is
// not available in this environment. Talks to an already-running Vite dev
// server (npm start, port 3000) over CDP via playwright-core.
//
// Usage:
//   node driver.mjs <path> <screenshot.png> [options]
//
// Options:
//   --geo=<lat>,<lng>       Mock browser geolocation (grants permission too).
//   --width=<px>            Viewport width (default 1280).
//   --height=<px>           Viewport height (default 800).
//   --wait=<ms>             Extra wait after networkidle, for client-side
//                           fetch-then-render pages (default 500).
//   --click=<selector>      Click this selector after load (repeatable, runs
//                           after fills/set-files, in given order).
//   --fill=<selector>=<v>   Fill an input/textarea before clicks (repeatable).
//   --set-files=<sel>=<p>   Set a file input's files to the given path
//                           (repeatable; use for upload flows).
//   --seed-user             Seed sessionStorage with a fake Administrator
//                           user before load — passes the client-side route
//                           gate for /add and /edit pages. The session
//                           re-validation will clear it unless combined with
//                           --mock-auth (see below).
//   --mock-auth=abort|401   abort: sever /api/auth/* at the network level —
//                           getSession() returns 'unknown', so a seeded user
//                           is KEPT (use with --seed-user to stay "logged
//                           in"; backend mutations still 401 for real, so no
//                           data can change).
//                           401: fulfill /api/auth/* with 401 + CORS —
//                           exercises the sign-out/rejection paths.
//   --accept-dialogs        Auto-accept window.confirm/alert dialogs (delete
//                           flows). Default is Playwright's dismiss.
//
// Examples:
//   node driver.mjs /species species.png
//   node driver.mjs /locations locations.png --geo=60.1699,24.9384 --width=600
//   node driver.mjs /locations/37/edit edit.png --seed-user --mock-auth=abort \
//     --click=".edit-location-sidebar .edit-nav-item:nth-child(2)"
//   node driver.mjs /login login.png --mock-auth=401 \
//     --fill='input[name="username"]=x' --fill='input[name="password"]=y' \
//     --click='button[type="submit"]'
//
// Prints page title, final URL, and any console errors/page errors to
// stdout, then exits 0 if the page loaded and 1 if it errored. A page with
// console errors still exits 0 (the load succeeded) — read the printed
// CONSOLE-ERROR lines to judge whether they matter.

import { chromium } from 'playwright-core';

const BASE_URL = 'http://localhost:3000';

const FAKE_USER = {
    id: 1,
    userName: 'devtester',
    roles: [{ id: 1, name: 'Administrator' }],
};

// CORS headers for mocked auth responses — without them the browser blocks
// the cross-origin fetch and a mocked 401 looks like a network error.
const CORS_HEADERS = {
    'Access-Control-Allow-Origin': BASE_URL,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'content-type',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

function parseArgs(argv) {
    const [path, screenshotPath, ...rest] = argv;
    const opts = {
        width: 1280,
        height: 800,
        wait: 500,
        clicks: [],
        fills: [],
        setFiles: [],
        seedUser: false,
        mockAuth: null,
        acceptDialogs: false,
    };
    for (const arg of rest) {
        const eq = arg.indexOf('=');
        const key = (eq === -1 ? arg : arg.slice(0, eq)).replace(/^--/, '');
        const value = eq === -1 ? '' : arg.slice(eq + 1);
        if (key === 'geo') {
            const [latitude, longitude] = value.split(',').map(Number);
            opts.geo = { latitude, longitude };
        } else if (key === 'width') {
            opts.width = Number(value);
        } else if (key === 'height') {
            opts.height = Number(value);
        } else if (key === 'wait') {
            opts.wait = Number(value);
        } else if (key === 'click') {
            opts.clicks.push(value);
        } else if (key === 'fill' || key === 'set-files') {
            const sep = value.lastIndexOf('=');
            if (sep === -1) {
                console.error(`Bad --${key} value (expected <selector>=<value>): ${value}`);
                process.exit(2);
            }
            const entry = { selector: value.slice(0, sep), value: value.slice(sep + 1) };
            (key === 'fill' ? opts.fills : opts.setFiles).push(entry);
        } else if (key === 'seed-user') {
            opts.seedUser = true;
        } else if (key === 'mock-auth') {
            if (value !== 'abort' && value !== '401') {
                console.error(`Bad --mock-auth value (expected abort|401): ${value}`);
                process.exit(2);
            }
            opts.mockAuth = value;
        } else if (key === 'accept-dialogs') {
            opts.acceptDialogs = true;
        }
    }
    return { path, screenshotPath, opts };
}

/**
 * Loads `path` against the local dev server in a fresh headless context,
 * applying auth mocks, session seeding, form fills and clicks, then
 * screenshots.
 * @param {string} path - Route to visit, e.g. "/locations".
 * @param {string} screenshotPath - Where to write the PNG screenshot.
 * @param {Object} opts - Parsed CLI options.
 */
async function run(path, screenshotPath, opts) {
    const browser = await chromium.launch({ headless: true });
    const contextOptions = {
        viewport: { width: opts.width, height: opts.height },
        permissions: opts.geo ? ['geolocation'] : [],
    };
    if (opts.geo) {
        contextOptions.geolocation = opts.geo;
    }
    const context = await browser.newContext(contextOptions);

    if (opts.seedUser) {
        await context.addInitScript((user) => {
            sessionStorage.setItem('currentUser', JSON.stringify(user));
        }, FAKE_USER);
    }

    const page = await context.newPage();

    if (opts.acceptDialogs) {
        page.on('dialog', (dialog) => dialog.accept());
    }

    if (opts.mockAuth === 'abort') {
        await page.route('**/api/auth/**', (route) => route.abort('connectionrefused'));
    } else if (opts.mockAuth === '401') {
        await page.route('**/api/auth/**', (route) => {
            if (route.request().method() === 'OPTIONS') {
                return route.fulfill({ status: 204, headers: CORS_HEADERS });
            }
            return route.fulfill({
                status: 401,
                headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
                body: '{"title":"Unauthorized"}',
            });
        });
    }

    const consoleErrors = [];
    page.on('console', (msg) => {
        if (msg.type() === 'error') {
            consoleErrors.push(msg.text());
        }
    });
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(String(err)));

    let failed = false;
    try {
        await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle', timeout: 30000 });
    } catch (err) {
        failed = true;
        console.error(`NAVIGATION-ERROR: ${err.message}`);
    }
    try {
        for (const { selector, value } of opts.fills) {
            await page.fill(selector, value, { timeout: 5000 });
        }
        for (const { selector, value } of opts.setFiles) {
            await page.setInputFiles(selector, value, { timeout: 5000 });
        }
        for (const selector of opts.clicks) {
            await page.click(selector, { timeout: 5000 });
        }
        await page.waitForTimeout(opts.wait);
        await page.screenshot({ path: screenshotPath, fullPage: true });
    } catch (err) {
        console.error(`SCREENSHOT-ERROR: ${err.message}`);
    }

    console.log(`TITLE: ${await page.title()}`);
    console.log(`URL: ${page.url()}`);
    for (const text of consoleErrors) {
        console.log(`CONSOLE-ERROR: ${text}`);
    }
    for (const text of pageErrors) {
        console.log(`PAGE-ERROR: ${text}`);
    }
    console.log(`SCREENSHOT: ${screenshotPath}`);

    await browser.close();
    process.exit(failed ? 1 : 0);
}

const { path, screenshotPath, opts } = parseArgs(process.argv.slice(2));
if (!path || !screenshotPath) {
    console.error('Usage: node driver.mjs <path> <screenshot.png> [--geo=lat,lng] [--width=px] [--height=px] [--wait=ms] [--fill=sel=value...] [--set-files=sel=path...] [--click=selector...] [--seed-user] [--mock-auth=abort|401] [--accept-dialogs]');
    process.exit(2);
}
run(path, screenshotPath, opts);
