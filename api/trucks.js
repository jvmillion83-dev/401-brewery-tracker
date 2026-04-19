const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const phantomPath = path.join(process.cwd(), 'phantom-data.json');
    const raggedPath = path.join(process.cwd(), 'ragged-data.json');
    const craftedPath = path.join(process.cwd(), 'crafted-hope-data.json');

    try {
        if (!fs.existsSync(phantomPath) || !fs.existsSync(raggedPath)) {
            console.error("Data files missing at:", process.cwd());
            return res.status(404).json({ error: "One or more data files not found" });
        }

        const phantomData = JSON.parse(fs.readFileSync(phantomPath, 'utf8'));
        const raggedData = JSON.parse(fs.readFileSync(raggedPath, 'utf8'));
        const craftedData = fs.existsSync(craftedPath) 
    ? JSON.parse(fs.readFileSync(craftedPath, 'utf8')) 
    : [];

        const combined = [
            ...phantomData.map(item => ({ ...item, brewery: "PHANTOM FARMS" })),
            ...raggedData.map(item => ({ ...item, brewery: "RAGGED ISLAND" })),
            ...craftedData.map(item => ({ ...item, brewery: "CRAFTED HOPE" }))
        ];

        const getSortTime = (d) => {
            if (!d) return 0;

            // FIX: Use the regex split here to handle the double-spaces in your JSON
            // This grabs the date part (04/19/2026) regardless of how many spaces follow it
            let datePart = d.trim().split(/\s+/)[0]; 
            
            // Ensures a full date string for the Date constructor if year is missing
            if ((datePart.match(/\//g) || []).length < 2) {
                datePart += '/2026';
            }
            
            const parsed = new Date(datePart);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
        };

        combined.sort((a, b) => getSortTime(a.start) - getSortTime(b.start));

        res.status(200).json(combined);
        
    } catch (error) {
        console.error("API Error details:", error.message);
        res.status(500).json({ error: "Failed to load brewery data", details: error.message });
    }
}