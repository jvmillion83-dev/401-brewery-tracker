const puppeteer = require('puppeteer');
const fs = require('fs');

const URL = "https://phantomfarmsbrewing.com/pages/calendar";

async function scrape() {
    console.log("Starting final scan of Phantom Farms...");
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        // Go to the site and wait for it to stop loading
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 30000 });

        const foodTrucks = await page.evaluate(() => {
            const results = [];
            const currentYear = new Date().getFullYear();
            const truckKeywords = ["Pizza", "Grill", "Lobster", "Kitchen", "Kreations", "Fusion", "Rocket", "Nanu", "Sticks", "FYR", "W's"];
            
            // This gets every single piece of text on the entire page
            const allText = document.body.innerText.split('\n');
            
            allText.forEach(line => {
                const trimmed = line.trim();
                // Check if the line has a truck keyword AND a month name
                const hasTruck = truckKeywords.some(key => trimmed.includes(key));
                const hasDate = /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(trimmed);
                
                if (hasTruck && hasDate) {
                    const dateMatch = trimmed.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s(\d{1,2})/i);
                    
                    if (dateMatch) {
                        const monthMap = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
                        const monthStr = dateMatch[1].substring(0, 3);
                        const formattedDate = `${monthMap[monthStr]}/${dateMatch[2]}/${currentYear}`;
                        
                        results.push({
                            "truck": trimmed,
                            "start": formattedDate,
                            "end": formattedDate,
                            "brewery": "PHANTOM FARMS"
                        });
                    }
                }
            });
            return results;
        });

        fs.writeFileSync('phantom-data.json', JSON.stringify(foodTrucks, null, 2));
        console.log(`✅ Success! Found ${foodTrucks.length} food truck dates.`);

    } catch (err) {
        console.error("❌ Final attempt failed:", err.message);
    } finally {
        await browser.close();
    }
}

scrape();