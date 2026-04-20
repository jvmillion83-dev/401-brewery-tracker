const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // We use __dirname and go up one level to reach the root where the JSONs live
   const baseDir = path.join(__dirname, '..', 'public');

const paths = {
    phantom: path.join(baseDir, 'phantom-data.json'),
    ragged: path.join(baseDir, 'ragged-data.json'),
    crafted: path.join(baseDir, 'crafted-hope-data.json'),
    manual: path.join(baseDir, 'manual-data.json')
};

    try {
        const phantomData = fs.existsSync(paths.phantom) ? JSON.parse(fs.readFileSync(paths.phantom, 'utf8')) : [];
        const raggedData = fs.existsSync(paths.ragged) ? JSON.parse(fs.readFileSync(paths.ragged, 'utf8')) : [];
        const craftedData = fs.existsSync(paths.crafted) ? JSON.parse(fs.readFileSync(paths.crafted, 'utf8')) : [];
        const manualData = fs.existsSync(paths.manual) ? JSON.parse(fs.readFileSync(paths.manual, 'utf8')) : [];

        const combined = [
            ...phantomData.map(item => ({ ...item, brewery: "PHANTOM FARMS" })),
            ...raggedData.map(item => ({ ...item, brewery: "RAGGED ISLAND" })),
            ...craftedData.map(item => ({ ...item, brewery: "CRAFTED HOPE BREWING" })),
            ...manualData 
        ];

        // Sorting by date/time
        const getSortTime = (d) => {
            if (!d) return 0;
            let datePart = d.trim().split(/\s+/)[0]; 
            if ((datePart.match(/\//g) || []).length < 2) datePart += '/2026';
            const parsed = new Date(datePart);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        };

        combined.sort((a, b) => getSortTime(a.start) - getSortTime(b.start));

        res.status(200).json(combined);
        
    } catch (error) {
        res.status(500).json({ error: "Failed to load data", details: error.message });
    }
}