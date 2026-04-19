const puppeteer = require('puppeteer');
const fs = require('fs'); 

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  console.log("🚚 Scraping Ragged Island...");

  try {
    await page.goto('https://raggedislandbrewing.com/food-trucks-and-events-at-ragged/', { 
        waitUntil: 'networkidle2' 
    });

const schedule = await page.evaluate(() => {
          const paragraphs = Array.from(document.querySelectorAll('p'));
          const results = [];
          
          paragraphs.forEach(p => {
            const text = p.innerText;
            if (text.match(/^\d{1,2}\/\d{1,2}/)) {
               // 1. Split by dash (they use both - and —)
               let parts = text.split(/[–—-]/);
               
               // 2. Logic: The truck is usually the part that DOESN'T mention music or trivia
               let truckName = parts.find(part => 
                  !part.toLowerCase().includes('live music') && 
                  !part.toLowerCase().includes('taproom') &&
                  !part.toLowerCase().includes('trivia') &&
                  !part.toLowerCase().includes('tickets')&&
   			!part.toLowerCase().includes('workshop') &&
 		  !part.toLowerCase().includes('kokedama') &&
 		  !part.toLowerCase().includes('special event') &&
		  // NEW FILTERS FOR THE FESTIVALS:
   !part.toLowerCase().includes('music festival') &&
   !part.toLowerCase().includes('concert series') &&
   !part.toLowerCase().includes('information') 
               ) || parts[parts.length - 1]; // Fallback to the last part if all else fails

               // 3. Final Polish: remove date and times
               truckName = truckName
                   .replace(/^\d{1,2}\/\d{1,2}/, '') // Remove date
                   .replace(/\d{1,2}:\d{2}/g, '')    // Remove times (8:00, etc)
                   .replace(/food truck|truck/gi, '') 
                   .replace(/:/g, '')               // Remove stray colons
                   .trim();
if (truckName.toLowerCase() === 'gram') {
    truckName = 'Farm to Sandwich';
}

               results.push({
                 truck: truckName || "Special Event",
                 start: text.match(/^\d{1,2}\/\d{1,2}/)[0], 
                 end: "Check Website",
                 brewery: "Ragged Island"
               });
            }
          });
          return results;
        });    fs.writeFileSync('ragged-data.json', JSON.stringify(schedule, null, 2));
    console.log(`✅ Success! Saved ${schedule.length} entries for Ragged Island.`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
})();