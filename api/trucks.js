const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // 1. Define paths correctly using process.cwd()
    // This points to the root folder where your JSON files live
    const paths = {
        phantom: path.join(process.cwd(), 'phantom-data.json'),
        ragged: path.join(process.cwd(), 'ragged-data.json'),
        crafted: path.join(process.cwd(), 'crafted-hope-data.json'),
        manual: path.join(process.cwd(), 'manual-data.json')
    };

    try {
        // 2. Read files with safety checks
        const phantomData = fs.existsSync(paths.phantom) ? JSON.parse(fs.readFileSync(paths.phantom, 'utf8')) : [];
        const raggedData = fs.existsSync(paths.ragged) ? JSON.parse(fs.readFileSync(paths.ragged, 'utf8')) : [];
        const craftedData = fs.existsSync(paths.crafted) ? JSON.parse(fs.readFileSync(paths.crafted, 'utf8')) : [];
        const manualData = fs.existsSync(paths.manual) ? JSON.parse(fs.readFileSync(paths.manual, 'utf8')) : [];

        // 3. Combine data
        const combined = [
            ...phantomData.map(item => ({ ...item, brewery: "PHANTOM FARMS" })),
            ...raggedData.map(item => ({ ...item, brewery: "RAGGED ISLAND" })),
            ...craftedData.map(item => ({ ...item, brewery: "CRAFTED HOPE BREWING" })),
            ...manualData 
        ];

        // 4. Sorting logic
        const getSortTime = (d) => {
            if (!d) return 0;
            let datePart = d.trim().split(/\s+/)[0]; 
            if ((datePart.match(/\//g) || []).length < 2) datePart += '/2026';
            const parsed = new Date(datePart);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        };

        combined.sort((a, b) => getSortTime(a.start) - getSortTime(b.start));

        // 5. Send response
        res.status(200).json(combined);
        
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ error: "Failed to load data", details: error.message });
    }
}