const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapeMoniker() {
    console.log("Launching browser context for Moniker...");
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    console.log("Navigating to Moniker Beer Menu...");
    await page.goto('https://www.monikerbrewery.com/providencebeer', { waitUntil: 'networkidle' });

    console.log("Locating the menu image asset...");
    const menuImageUrl = await page.evaluate(() => {
        // Find images inside the main content area, ignoring logos and nav icons
        const images = Array.from(document.querySelectorAll('main img, #content img, .sqs-block-image img'));
        
        // Find the image that likely represents the menu
        const menuImg = images.find(img => {
            const src = img.src.toLowerCase();
            const alt = (img.alt || '').toLowerCase();
            return src.includes('menu') || src.includes('draft') || alt.includes('menu') || alt.includes('draft') || img.clientWidth > 400;
        });

        return menuImg ? menuImg.src || menuImg.getAttribute('data-src') : null;
    });

    if (menuImageUrl) {
        console.log(`Found live menu image: ${menuImageUrl}`);
    } else {
        console.log("Warning: Could not isolate a primary menu image block.");
    }

    const output = {
        "isImageMenu": true,
        "menuImageUrl": menuImageUrl || "https://www.monikerbrewery.com/providencebeer",
        "lastUpdated": new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    };

    const dataDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(dataDir)){
        fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(path.join(dataDir, 'moniker-menu.json'), JSON.stringify(output, null, 2), 'utf-8');
    console.log("Successfully saved Moniker image link data asset!");
    await browser.close();
}

scrapeMoniker();