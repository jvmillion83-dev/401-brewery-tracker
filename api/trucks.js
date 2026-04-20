const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // 1. Establish the root directory for Vercel deployment
    const root = path.resolve(process.cwd());
    
    // 2. Define absolute paths to all JSON data files
    const paths = {
        phantom: path.join(root, 'phantom-data.json'),
        ragged: path.join(root, 'ragged-data.json'),
        crafted: path.join(root, 'crafted-hope-data.json'),
        manual: path.join(root, 'manual-data.json')
    };

    try {
        // 3. Read and parse files (defaulting to an empty array if file is missing/empty)
        const phantomData = fs.existsSync(paths.phantom) ? JSON.parse(fs.readFileSync(paths.phantom, 'utf8')) : [];
        const raggedData = fs.existsSync(paths.ragged) ? JSON.parse(fs.readFileSync(paths.ragged, 'utf8')) : [];
        const craftedData = fs.existsSync(paths.crafted) ? JSON.parse(fs.readFileSync(paths.crafted, 'utf8')) : [];
        const manualData = fs.existsSync(paths.manual) ? JSON.parse(fs.readFileSync(paths.manual, 'utf8')) : [];

        // 4. Combine all sources into a single array
        // We map the scraped files to ensure they have the correct Brewery Name
        const combined = [
            ...phantomData.map(item => ({ ...item, brewery: "PHANTOM FARMS" })),
            ...raggedData.map(item => ({ ...item, brewery: "RAGGED ISLAND" })),
            ...craftedData.map(item => ({ ...item, brewery: "CRAFTED HOPE BREWING" })),
            ...manualData // Bravo and Uncommon Pair already have names in your manual-data.json
        ];

        // 5. Sorting logic based on start time
        const getSortTime = (d) => {
            if (!d) return 0;
            // Extract the date part (MM/DD/YYYY)
            let datePart = d.trim().split(/\s+/)[0]; 
            // Add year if the scraper only provides MM/DD
            if ((datePart.match(/\//g) || []).length < 2) {
                datePart += '/2026';
            }
            const parsed = new Date(datePart);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        };

        combined.sort((a, b) => getSortTime(a.start) - getSortTime(b.start));

        // 6. Return the data to the frontend
        res.status(200).json(combined);
        
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ 
            error: "Failed to load brewery data", 
            details: error.message 
        });
    }
}