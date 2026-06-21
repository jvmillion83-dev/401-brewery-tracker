const puppeteer = require('puppeteer');

async function runScraper() {
    // 1. Launch the browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // 2. Go to the page
    await page.goto('https://www.lopsbrewing.com/tasting-room-menu');

    // 3. Now page is defined, and you can run evaluate
    const beerData = await page.evaluate(() => {
        const beerElements = document.querySelectorAll('.wixui-repeater__item');
        return Array.from(beerElements).map(el => ({
            name: el.querySelector('h1')?.innerText.trim() || "N/A",
            style: "N/A",
            abv: el.querySelector('h6')?.innerText.trim() || "N/A",
            description: `${el.querySelector('.wixui-collapsible-text__text')?.innerText.trim() || ""} | Price: ${el.querySelector('.font_7')?.innerText.trim() || "N/A"}`
        }));
    });


    console.log(beerData);

const fs = require('fs');

// 1. Prepare the data in the format your app expects
const outputData = {
    "Beer on tap": beerData
};

// 2. Write the file to your /data folder
fs.writeFileSync('../public/data/lops-menu.json', JSON.stringify(outputData, null, 2));

console.log('Successfully saved to ../public/data/lops-menu.json');

    // 4. Close the browser
    await browser.close();
}




runScraper();
