const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function scrapeFoolproof() {
    console.log("Launching stealth browser context...");
    const browser = await chromium.launch({ 
        headless: true,
        args: [
            '--disable-blink-features=AutomationControlled',
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });
    
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    await page.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    
    console.log("Navigating to Foolproof Pawtucket On-Tap...");
    await page.goto('https://www.foolproofbrewing.com/pawtucket/on-tap', { waitUntil: 'networkidle' });

    console.log("Waiting for live menu data to stream into page layers...");
    let combinedText = "";
    let menuLoaded = false;
    let attempts = 0;
    const maxAttempts = 20;

    while (!menuLoaded && attempts < maxAttempts) {
        combinedText = "";
        const frames = page.frames();
        
        for (const frame of frames) {
            try {
                const frameText = await frame.evaluate(() => document.body.innerText);
                if (frameText) combinedText += "\n" + frameText;
            } catch (e) {}
        }

        const containsRealBeers = /(\d+(?:\.\d+)?%)\s*ABV/i.test(combinedText);

        if (containsRealBeers) {
            menuLoaded = true;
            console.log(` Menu verified and captured on attempt ${attempts + 1}!`);
        } else {
            attempts++;
            await page.waitForTimeout(1000);
        }
    }

    if (!menuLoaded) {
        console.log("Warning: Timed out waiting for live items.");
    }

    const scrapedBeers = [];
    console.log("Parsing menu layout dynamically...");

    // Global Regex Pattern: Captures each block ending in ABV regardless of line separators
    const beerRegex = /(?:[-•*]\s*)?(\d+)\.\s+([\s\S]*?)\s+(\d+(?:\.\d+)?%)\s*ABV/gi;
    let match;

    while ((match = beerRegex.exec(combinedText)) !== null) {
        let fullHeader = match[2].trim();
        const abv = match[3].trim();

        // Separate layout overflow strings if multiple lines bleed together
        if (fullHeader.includes('\n')) {
            fullHeader = fullHeader.split('\n').pop().trim();
        }

        // Clean up trailing punctuation noise
        if (fullHeader.endsWith('.')) fullHeader = fullHeader.slice(0, -1).trim();
        if (fullHeader.endsWith('-')) fullHeader = fullHeader.slice(0, -1).trim();

        // Exclude footer/header noise
        if (fullHeader.toLowerCase().includes('foolproof brewing')) {
            fullHeader = fullHeader.replace(/foolproof brewing(?: company)?\.?/i, '').trim();
        }

        let name = fullHeader;
        let style = 'Craft Beer';

        if (fullHeader.includes(' - ')) {
            const parts = fullHeader.split(' - ');
            name = parts[0].trim();
            style = parts[1].trim();
        } else if (fullHeader.includes('. ')) {
            const parts = fullHeader.split('. ');
            name = parts[0].trim();
            style = parts[1].trim();
        }

       
      if (name && name.length < 50 && !scrapedBeers.some(b => b.name.toLowerCase() === name.toLowerCase())) {
    scrapedBeers.push({ name, style, abv });
}
    }

    const output = {
        "Beer on tap": scrapedBeers,
        "lastUpdated": new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
    };

    const dataDir = path.join(__dirname, '../public/data');
    if (!fs.existsSync(dataDir)){
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const outputPath = path.join(dataDir, 'foolproof-menu.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
    
    console.log(`Successfully scraped ${scrapedBeers.length} beers from Foolproof Brewing!`);

    await browser.close();
}

scrapeFoolproof();