const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function scrapeUncommon() {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 5000 }); 

    try {
        console.log("Navigating to Uncommon Pair...");
        await page.goto('https://www.uncommonpairbrewing.com/our-beers', { 
            waitUntil: 'networkidle0', 
            timeout: 60000 
        });

        console.log("Waiting for menu to load...");
        await new Promise(r => setTimeout(r, 5000)); 

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

        console.log("Extracting beer data...");
        const beerData = await page.evaluate(() => {
            const results = [];
            const seenNames = new Set();
            const items = document.querySelectorAll('.menu-item, [data-type="menu-item"], .sqs-block-content strong');
            
            items.forEach(item => {
                const container = item.closest('.menu-item') || item.parentElement;
                const text = container.innerText;
                const abvMatch = text.match(/ABV\s?\d+(\.\d+)?%/i);
                const titleEl = container.querySelector('.menu-item-title, strong, h3');
                const title = titleEl ? titleEl.innerText.trim() : "";

                if (abvMatch && title) {
                    const name = title.toUpperCase();
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

        const dataPath = path.join(__dirname, '..', 'public', 'data'); 
        const filePath = path.join(dataPath, 'uncommon-pair-menu.json');

       if (!fs.existsSync(dataPath)) { 
        fs.mkdirSync(dataPath, { recursive: true }); 
}
        
        fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
        
        console.log(`Successfully found ${beerData.length} beers!`);
        console.log(`Updated: ${output.lastUpdated}`);

    } catch (error) {
        console.error("Scraping failed:", error);
    } finally {
        await browser.close();
    }
}

scrapeUncommon();