const puppeteer = require('puppeteer');
const fs = require('fs'); 

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("🚚 Scraping and Saving: Phantom Farms...");
  
  try {
    await page.goto('https://phantomfarmsbrewing.com/pages/calendar', { 
        waitUntil: 'networkidle2',
        timeout: 60000 
    });

    const rawSchedule = await page.evaluate(() => {
      const events = document.querySelectorAll('.tsc--eventModalLink');
      return Array.from(events).map(event => ({
        truck: event.getAttribute('data-event-title'),
        start: event.getAttribute('data-event-start'),
        end: event.getAttribute('data-event-end')
      }));
    });

    // Enhanced Filter: Removes duplicates AND noise
    const uniqueSchedule = [];
    const seen = new Set();

    rawSchedule.forEach(item => {
      const name = item.truck.toLowerCase();
      // We create a unique "ID" using the name and the start time
      const identifier = `${item.truck}-${item.start}`; 

      const isNoise = name.includes('trivia') || 
                      name.includes('taproom') || 
                      name.includes('music');

      if (!isNoise && !seen.has(identifier)) {
        seen.add(identifier);
        uniqueSchedule.push(item);
      }
    });

    // Save the final cleaned list to your JSON file
    fs.writeFileSync('phantom-data.json', JSON.stringify(uniqueSchedule, null, 2));
    
    console.log(`✅ Success! Data saved to phantom-data.json`);
    console.log(`✨ Found ${uniqueSchedule.length} unique food truck dates.`);
    console.table(uniqueSchedule); 

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
})();