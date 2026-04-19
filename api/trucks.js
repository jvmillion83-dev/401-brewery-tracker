const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // Use path.resolve and join with the current working directory
    // This is the most reliable way to find root files in a Vercel environment
    const phantomPath = path.join(process.cwd(), 'phantom-data.json');
    const raggedPath = path.join(process.cwd(), 'ragged-data.json');

    try {
        // Check if files exist before reading to provide better error logging
        if (!fs.existsSync(phantomPath) || !fs.existsSync(raggedPath)) {
            console.error("Data files missing at:", process.cwd());
            return res.status(404).json({ error: "One or more data files not found" });
        }

        const phantomData = JSON.parse(fs.readFileSync(phantomPath, 'utf8'));
        const raggedData = JSON.parse(fs.readFileSync(raggedPath, 'utf8'));

        const combined = [
            ...phantomData.map(item => ({ ...item, brewery: "PHANTOM FARMS" })),
            ...raggedData.map(item => ({ ...item, brewery: "RAGGED ISLAND" }))
        ];

        const getSortTime = (d) => {
            if (!d) return 0;
            let datePart = d.split(' ')[0]; 
            
            // Ensures a full date string for the Date constructor
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