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
    
const menuData = await page.evaluate(() => {
    // Select all dynamic list wrappers
    const sections = Array.from(document.querySelectorAll('.w-dyn-list')); 
    
    return sections.map(section => {
        // Grab the header immediately preceding the list
        const header = section.previousElementSibling?.innerText.trim() || "Menu";
        
        // Grab items within this section
        const items = Array.from(section.querySelectorAll('.collection-item-8')).map(el => ({
            name: el.querySelector('.food-menu-item')?.innerText.trim() || "N/A",
            price: `$${el.querySelector('.food-price-3')?.innerText.trim() || "0"}`,
            description: el.querySelector('.food-description')?.innerText.trim() || ""
        }));

        return { header, items };
    });
});

    // 5. Save the grouped data to your data folder
const outputData = { "Food on site": menuData }; // Changed foodData to menuData
fs.writeFileSync('../public/data/guild-food-menu.json', JSON.stringify(outputData, null, 2));

console.log('Successfully saved Guild food menu to ../public/data/guild-food-menu.json');

    await browser.close();
}

scrapeGuild().catch(err => console.error(err));