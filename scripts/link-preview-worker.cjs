const { chromium } = require('/usr/local/lib/node_modules/playwright');

const url = process.argv[2];
if (!url) {
    console.error('Usage: node link-preview-worker.cjs <url>');
    process.exit(1);
}

(async () => {
    let browser;
    try {
        browser = await chromium.launch({
            executablePath: '/usr/local/share/playwright-browsers/chromium-1223/chrome-linux64/chrome',
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-blink-features=AutomationControlled',
            ],
        });

        const context = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Mobile Safari/537.36',
        });

        const page = await context.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

        // Wait for JS to render OG tags (TikTok, Instagram, etc.)
        await page.waitForTimeout(3000);

        const result = await page.evaluate(() => {
            const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content') ?? null;
            const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? null;
            const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? null;
            const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content') ?? null;
            const twitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ?? null;
            const twitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ?? null;
            const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null;
            const pageTitle = document.title;

            const image = ogImage ?? twitterImage ?? null;
            let title = ogTitle ?? twitterTitle ?? null;
            const description = ogDescription ?? twitterDescription ?? metaDescription ?? null;

            if (!title) {
                title = pageTitle || null;
            }

            return { image, title, description };
        });

        console.log(JSON.stringify(result));
    } catch (err) {
        console.log(JSON.stringify({ image: null, title: null, description: null }));
    } finally {
        if (browser) {
            await browser.close();
        }
    }
})();
