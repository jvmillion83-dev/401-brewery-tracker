import * as cheerio from 'cheerio';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const URL = "https://phantomfarmsbrewing.com/pages/calendar";

async function scrape() {
    console.log("Connecting to Phantom Farms...");
    
    try {
        const response = await fetch(URL);
        const html = await response.text();
        const $ = cheerio.load(html);
        
        let foodTrucks = [];
        const currentYear = new Date().getFullYear();

        $('li, p, .event-item').each((i, el) => {
            const text = $(el).text().trim();
            const isFood = /Food Truck|Pizza|Grill|Lobster|Kitchen|Kreations|Fusion/i.test(text);
            
            if (isFood) {
                const dateMatch = text.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s(\d{1,2})/i);
                
                if (dateMatch) {
                    // Convert "Apr 23" to "4/23/2026" so your app's normalize() helper works perfectly
                    const monthMap = { Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6, Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12 };
                    const monthNum = monthMap[dateMatch[1]];
                    const dayNum = dateMatch[2];
                    const formattedDate = `${monthNum}/${dayNum}/${currentYear}`;

                    const truckName = text.split('●')[0].replace(dateMatch[0], '').trim();

                    foodTrucks.push({
                        "truck": truckName || text,
                        "start": formattedDate,
                        "end": formattedDate,
                        "brewery": "PHANTOM FARMS"
                    });
                }
            }
        });

        // This ensures it saves into the public folder regardless of where you run it from
        const outputPath = './public/phantom-data.json';
        await writeFile(outputPath, JSON.stringify(foodTrucks, null, 2));
        
        console.log(`✅ Success! Found ${foodTrucks.length} entries.`);
        console.log(`Check ${outputPath} for your updates.`);

    } catch (err) {
        console.error("❌ Scrape failed:", err);
    }
}

scrape();