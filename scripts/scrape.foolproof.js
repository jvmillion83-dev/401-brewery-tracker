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
    console.log("Parsing menu layout using clean element selectors...");

    // Find the right frame containing the menu items
    const frames = page.frames();
    for (const frame of frames) {
        try {
            // Target all individual menu item containers inside the widget layout
            const items = await frame.$$('.menu-item, [class*="item"], .menu-list > div'); 
            
            // Fallback to text parsing if classes are completely obfuscated, 
            // but let's optimize the text-stream split to match the visual layout in image_2b2168.png
            if (items.length === 0) {
                continue;
            }
        } catch (e) {}
    }

    // ROBUST TEXT-STREAM PARSER OPTIMIZED FOR THE VISUAL LAYOUT
    // This regex looks at the pattern: Number. Name [Newlines/Spaces] Style [Newlines/Spaces] ABV% ABV
    const beerRegex = /(?:[-•*]\s*)?(\d+)\.\s+([\s\S]*?)\s+(\d+(?:\.\d+)?%)\s*ABV/gi;
    let match;

    while ((match = beerRegex.exec(combinedText)) !== null) {
        let rawContent = match[2].trim(); // Contains Name + Style
        const abv = match[3].trim();

        // Break lines apart and clean them up
        let lines = rawContent.split('\n').map(l => l.trim()).filter(Boolean);
        
        let name = "";
        let style = "Craft Beer";

        if (lines.length === 1) {
            // Handle single-line space/dash layouts smoothly
            let cleanText = lines[0];
            if (cleanText.includes(' - ')) {
                const parts = cleanText.split(' - ');
                name = parts[0].trim();
                style = parts[1].trim();
            } else {
                name = cleanText;
            }
        } else if (lines.length >= 2) {
            // The first line is ALWAYS the name
            name = lines[0];
            // Combine any remaining lines (like "Stout" and "- Milk") into the style
            style = lines.slice(1).join(' ').replace(/\s*-\s*/g, ' - ').trim();
        }

        // Clean up common duplicate string noise (e.g., "Lager Lager" -> "Lager")
        const nameWords = name.split(' ');
        if (nameWords.length > 1 && nameWords[nameWords.length - 1] === nameWords[nameWords.length - 2]) {
            nameWords.pop();
            name = nameWords.join(' ');
        }

        // Strip corporate footers or accidental attribution blocks
        if (name.toLowerCase().includes('foolproof brewing')) {
            name = name.replace(/foolproof brewing(?: company)?\.?/i, '').trim();
        }
        if (style.toLowerCase().includes('foolproof brewing')) {
            style = style.replace(/foolproof brewing(?: company)?\.?/i, '').trim();
        }

        // Clean up trailing punctuation noise
        if (name.endsWith('.')) name = name.slice(0, -1).trim();
        if (name.endsWith('-')) name = name.slice(0, -1).trim();
        if (style.endsWith('.')) style = style.slice(0, -1).trim();
        if (style.startsWith('-')) style = style.slice(1).trim();

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