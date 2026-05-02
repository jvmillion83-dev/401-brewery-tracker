const puppeteer = require('puppeteer');
const fs = require('fs'); 

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("🚚 Scraping and Saving: Ragged Island...");
  
  try {
    await page.goto('https://raggedislandbrewing.com/food-trucks-and-events-at-ragged/', { 
        waitUntil: 'networkidle2' 
    });

    const schedule = await page.evaluate(() => {
      // Ragged Island lists events in text blocks, usually starting with the date (e.g., 4/10)
      const paragraphs = Array.from(document.querySelectorAll('p'));
      const results = [];
      
      paragraphs.forEach(p => {
        const text = p.innerText;
        // Look for lines that start with a date like 4/10 or 04/10
        if (text.match(/^\d{1,2}\/\d{1,2}/)) {
           results.push({
             brewery: "Ragged Island",
             details: text.trim()
           });
        }
      });
      return results;
    });

    fs.writeFileSync('ragged-data.json', JSON.stringify(schedule, null, 2));
    console.log(`✅ Success! Found ${schedule.length} entries for Ragged Island.`);

  } catch (err) {
    console.error("❌ Error:", err.message);
  } finally {
    await browser.close();
  }
})();