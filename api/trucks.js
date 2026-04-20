
const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // 1. Define all paths
    const phantomPath = path.join(process.cwd(), 'phantom-data.json');
    const raggedPath = path.join(process.cwd(), 'ragged-data.json');
    const craftedPath = path.join(process.cwd(), 'crafted-hope-data.json');
    const manualPath = path.join(process.cwd(), 'manual-data.json');

    try {
        // 2. Read files (with safety checks)
        const phantomData = fs.existsSync(phantomPath) ? JSON.parse(fs.readFileSync(phantomPath, 'utf8')) : [];
        const raggedData = fs.existsSync(raggedPath) ? JSON.parse(fs.readFileSync(raggedPath, 'utf8')) : [];
        const craftedData = fs.existsSync(craftedPath) ? JSON.parse(fs.readFileSync(craftedPath, 'utf8')) : [];
        const manualData = fs.existsSync(manualPath) ? JSON.parse(fs.readFileSync(manualPath, 'utf8')) : [];

        // 3. Combine everything into one array
        const combined = [
    ...phantomData.map(item => ({ ...item, brewery: "PHANTOM FARMS" })),
    ...raggedData.map(item => ({ ...item, brewery: "RAGGED ISLAND" })),
    ...craftedData.map(item => ({ ...item, brewery: "CRAFTED HOPE BREWING" })),
    ...manualData // This pulls BRAVO from your manual-data.json
];

        // 4. Sorting logic
        const getSortTime = (d) => {
            if (!d) return 0;
            let datePart = d.trim().split(/\s+/)[0]; 
            if ((datePart.match(/\//g) || []).length < 2) {
                datePart += '/2026';
            }
            const parsed = new Date(datePart);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        };

        combined.sort((a, b) => getSortTime(a.start) - getSortTime(b.start));

        // 5. Send response
        res.status(200).json(combined);
        
    } catch (error) {
        console.error("API Error details:", error.message);
        res.status(500).json({ error: "Failed to load brewery data", details: error.message });
    }
}