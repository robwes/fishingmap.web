#!/usr/bin/env node
// Headless-Chromium driver for fishingmap.web, used because `chromium-cli` is
// not available in this environment. Talks to an already-running Vite dev
// server (npm start, port 3000) over CDP via playwright-core.
//
// Usage:
//   node driver.mjs <path> <screenshot.png> [options]
//
// Options:
//   --geo=<lat>,<lng>   Mock browser geolocation (grants permission too).
//   --width=<px>        Viewport width (default 1280).
//   --height=<px>       Viewport height (default 800).
//   --wait=<ms>         Extra wait after networkidle, for client-side
//                       fetch-then-render pages (default 500).
//   --click=<selector>  Click this selector after load, before the wait
//                       and screenshot (repeatable).
//
// Examples:
//   node driver.mjs /species species.png
//   node driver.mjs /locations locations.png --geo=60.1699,24.9384 --width=600
//   node driver.mjs /locations locations.png --click=".ms-control"
//
// Prints page title, final URL, and any console errors/page errors to
// stdout, then exits 0 if the page loaded and 1 if it errored. A page with
// console errors still exits 0 (the load succeeded) — read the printed
// CONSOLE-ERROR lines to judge whether they matter.

import { chromium } from 'playwright-core';

const BASE_URL = 'http://localhost:3000';

function parseArgs(argv) {
    const [path, screenshotPath, ...rest] = argv;
    const opts = { width: 1280, height: 800, wait: 500, clicks: [] };
    for (const arg of rest) {
        const [key, value] = arg.replace(/^--/, '').split('=');
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
        }
    }
    return { path, screenshotPath, opts };
}

/**
 * Loads `path` against the local dev server in a fresh headless context,
 * optionally mocking geolocation and clicking selectors, then screenshots.
 * @param {string} path - Route to visit, e.g. "/locations".
 * @param {string} screenshotPath - Where to write the PNG screenshot.
 * @param {Object} opts - Parsed CLI options (geo, width, height, wait, clicks).
 */
async function run(path, screenshotPath, opts) {
    const browser = await chromium.launch({ headless: true });
    const contextOptions = {
        viewport: { width: opts.width, height: opts.height },
        permissions: opts.geo ? ['geolocation'] : [],
        geolocation: opts.geo,
    };
    const context = await browser.newContext(contextOptions);
    const page = await context.newPage();

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
    console.error('Usage: node driver.mjs <path> <screenshot.png> [--geo=lat,lng] [--width=px] [--height=px] [--wait=ms] [--click=selector...]');
    process.exit(2);
}
run(path, screenshotPath, opts);
