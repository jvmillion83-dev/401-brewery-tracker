const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeGuild() {
    // 1. Launch the browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // 2. Go to the page
    await page.goto('https://www.theguildpawtucket.com/', { waitUntil: 'networkidle2' });

    // 3. Wait for the beer list container to be present
    await page.waitForSelector('.collection-item-6', { timeout: 10000 });

    // 4. Scrape the data
    const beerData = await page.evaluate(() => {
        const beerElements = document.querySelectorAll('.collection-item-6');
        return Array.from(beerElements).map(el => {
            const name = el.querySelector('.beer-name')?.innerText.trim() || "N/A";
            const style = el.querySelector('.beer-style')?.innerText.trim() || "N/A";
            const abv = el.querySelector('.abv')?.innerText.trim() || "0";
            const description = el.querySelector('.beer-detail')?.innerText.trim() || "";
            const ibu = el.querySelector('.ibu-2')?.innerText.trim() || "";

            return {
                name: name,
                style: style,
                abv: `${abv}%`,
                description: description + (ibu ? ` | IBU: ${ibu}` : "")
            };
        });
    });

    // 5. Save the data to your data folder
    const outputData = { "Beer on tap": beerData };
    fs.writeFileSync('../public/data/guild-menu.json', JSON.stringify(outputData, null, 2));

    console.log('Successfully saved Guild menu to ../public/data/guild-menu.json');

    await browser.close();
}

scrapeGuild().catch(err => console.error(err));