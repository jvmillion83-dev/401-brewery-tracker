const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapePhantomFarms() {
    const browser = await puppeteer.launch({ headless: false }); 
    const page = await browser.newPage();

    try {
        console.log("Navigating to Phantom Farms...");
        await page.goto('https://phantomfarmsbrewing.com/pages/beers-on-tap', { 
            waitUntil: 'networkidle2', 
            timeout: 60000 
        });

        // 1. DISMISS POPUP
        await new Promise(r => setTimeout(r, 6000));
        await page.evaluate(() => {
            const closeBtn = Array.from(document.querySelectorAll('span'))
                .find(s => s.innerText.toLowerCase().includes('not right now'));
            if (closeBtn) closeBtn.click();
        });

        // 2. ACTIVE HYDRATION LOOP
        console.log("Polling frames for data...");
        let dataDetected = false;
        for (let i = 0; i < 15; i++) {
            // Incremental scroll to trigger lazy-loading
            await page.evaluate((y) => window.scrollTo(0, y), 500 + (i * 200));
            
            const frames = page.frames();
            const contents = await Promise.all(frames.map(f => f.evaluate(() => document.body.innerText)));
            
            if (contents.some(text => text.includes('% ABV'))) {
                console.log(`✅ Data detected on attempt ${i + 1}!`);
                dataDetected = true;
                break;
            }
            await new Promise(r => setTimeout(r, 2000));
        }

        if (!dataDetected) throw new Error("Could not find beer data in any frame.");

        const beerMap = new Map();
        const frames = page.frames();

        for (const frame of frames) {
            const frameData = await frame.evaluate(() => {
                const items = Array.from(document.querySelectorAll('[class*="item-container"]'));
                if (items.length === 0) return null;

                const bodyText = document.body.innerText.toLowerCase();
                const type = (bodyText.includes("on tap") || bodyText.includes("draft")) ? "On Tap" : "Cans to go";

                return items.map(i => ({
                    rawName: i.querySelector('[class*="name"]')?.innerText || "",
                    rawText: i.innerText || "",
                    type: type
                }));
            });

            if (frameData) {
                frameData.forEach(b => {
                    const junk = ["shopify", "More Info", "{", "margin-top"];
                    if (!b.rawName || junk.some(j => b.rawName.includes(j))) return;

                    // Clean name and style
                    let nameParts = b.rawName.split(/(Pilsner|IPA|Lager|Saison|Ale|Stout|Cider|Farmhouse|Mexican|Porter)/i);
                    let name = nameParts[0].trim();
                    let style = nameParts.slice(1).join("").trim() || "Craft Beer";
                    const abvMatch = b.rawText.match(/(\d+(\.\d+)?%)/);
                    
                    // CLEAN DESCRIPTION: Strips out the redundant head-matter
                    let description = b.rawText
                        .replace(b.rawName, '') 
                        .replace(/(\d+(\.\d+)?%(\s+)?ABV)/gi, '') 
                        .replace(new RegExp(style, 'gi'), '') 
                        .replace(/More Info|Less Info|▲|▸/g, '')
                        .replace(/\n/g, ' ') 
                        .trim();

                    if (name && !beerMap.has(name)) {
                        beerMap.set(name, {
                            name,
                            style,
                            abv: abvMatch ? abvMatch[0] : "N/A",
                            type: b.type,
                            description
                        });
                    }
                });
            }
        }

        const output = {
            beers: Array.from(beerMap.values()),
            lastUpdated: new Date().toLocaleString()
        };

        if (output.beers.length > 0) {
            fs.writeFileSync('phantom-menu.json', JSON.stringify(output, null, 2));
            console.log(`🚀 Success! Saved ${output.beers.length} beer entries.`);
        } else {
            console.log("⚠️ Scrape completed but no beers were saved.");
        }

    } catch (err) {
        console.error("❌ Fatal Error:", err.message);
    } finally {
        await browser.close();
    }
}

scrapePhantomFarms();