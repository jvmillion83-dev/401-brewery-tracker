const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeUncommon() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 5000 }); 

    try {
        console.log("Navigating...");
        await page.goto('https://www.uncommonpairbrewing.com/our-beers', { 
            waitUntil: 'networkidle0', 
            timeout: 60000 
        });

        console.log("Forcing a long wait for all assets...");
        await new Promise(r => setTimeout(r, 5000)); 

        // Comprehensive Scroll to trigger lazy-loading
        await page.evaluate(async () => {
            await new Promise((resolve) => {
                let totalHeight = 0;
                let distance = 100;
                let timer = setInterval(() => {
                    let scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;
                    if(totalHeight >= scrollHeight){
                        clearInterval(timer);
                        window.scrollTo(0, 0); 
                        resolve();
                    }
                }, 100);
            });
        });

        console.log("Scanning page for new menu structure...");
        const beerData = await page.evaluate(() => {
            const results = [];
            const seenNames = new Set();

            // Updated selector to catch the new three-column grid
            const items = document.querySelectorAll('.menu-item, [data-type="menu-item"], .sqs-block-content strong');
            
            items.forEach(item => {
                // If it's a generic block, we look at the parent to find the beer info
                const container = item.closest('.menu-item') || item.parentElement;
                const text = container.innerText;
                const abvMatch = text.match(/ABV\s?\d+(\.\d+)?%/i);
                
                // Title is either the strong tag or the specific menu title class
                const titleEl = container.querySelector('.menu-item-title, strong, h3');
                const title = titleEl ? titleEl.innerText.trim() : "";

                if (abvMatch && title) {
                    const name = title.toUpperCase();
                    // REMOVED: "GOOSEBERRY DRIFT" filter to match the new tap list
                    if (!seenNames.has(name) && !name.includes("STAY UNCOMMON")) {
                        seenNames.add(name);
                        results.push({
                            name: name,
                            abv: abvMatch[0],
                            description: text.replace(title, "").replace(abvMatch[0], "").trim()
                        });
                    }
                }
            });
            
            return results;
        });

        const output = {
            lastUpdated: new Date().toLocaleString(),
            count: beerData.length,
            beers: beerData
        };

        if (!fs.existsSync('./data')) { fs.mkdirSync('./data'); }
        fs.writeFileSync('./data/uncommon-pair-menu.json', JSON.stringify(output, null, 2));
        
        console.log(`Successfully found ${beerData.length} beers for Brew 401!`);

    } catch (error) {
        console.error("Scraping failed:", error);
    } finally {
        await browser.close();
    }
}

scrapeUncommon();