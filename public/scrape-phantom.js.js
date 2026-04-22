import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';

const URL = "https://phantomfarmsbrewing.com/pages/calendar";

async function scrape() {
    console.log("Connecting to Phantom Farms...");
    
    try {
        const response = await fetch(URL);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        let foodTrucks = [];
        const currentYear = new Date().getFullYear();

        // Phantom's calendar lists events in text blocks usually following a date
        // We look for bullet points or specific text containers
        $('li, p, .event-item').each((i, el) => {
            const text = $(el).text().trim();
            
            // Check if this line contains a food truck or specific vendor
            const isFood = /Food Truck|Pizza|Grill|Lobster|Kitchen|Kreations|Fusion/i.test(text);
            
            if (isFood) {
                // Try to find a date in the string like "April 23" or "04/23"
                const dateMatch = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2}/i);
                let dateStr = dateMatch ? `${dateMatch[0]}, ${currentYear}` : "Check Calendar";

                // Clean the truck name (remove the date and bullets)
                const truckName = text.split('●')[0].replace(dateMatch ? dateMatch[0] : '', '').trim();

                foodTrucks.push({
                    "truck": truckName || text,
                    "start": dateStr,
                    "end": dateStr,
                    "brewery": "PHANTOM FARMS"
                });
            }
        });

        // Save to your phantom-data.json file
        await writeFile('phantom-data.json', JSON.stringify(foodTrucks, null, 2));
        
        console.log(`✅ Success! Found ${foodTrucks.length} entries.`);
        console.log("Check phantom-data.json for your updates.");

    } catch (err) {
        console.error("❌ Scrape failed:", err);
    }
}

scrape();