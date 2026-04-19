const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    // 1. Define paths to your data files (moving up one level from /api)
    const phantomPath = path.join(process.cwd(), 'phantom-data.json');
    const raggedPath = path.join(process.cwd(), 'ragged-data.json');

    try {
        // 2. Read the JSON files
        const phantomData = JSON.parse(fs.readFileSync(phantomPath, 'utf8'));
        const raggedData = JSON.parse(fs.readFileSync(raggedPath, 'utf8'));

        // 3. Combine and label the data
        const combined = [
            ...phantomData.map(item => ({ ...item, brewery: "PHANTOM FARMS" })),
            ...raggedData.map(item => ({ ...item, brewery: "RAGGED ISLAND" }))
        ];

        // 4. Sort logic (keeping it chronological)
        const getSortTime = (d) => {
            if (!d) return 0;
            let datePart = d.split(' ')[0];
            if (!datePart.includes('2026')) datePart += '/2026';
            return new Date(datePart).getTime();
        };

        combined.sort((a, b) => getSortTime(a.start) - getSortTime(b.start));

        // 5. Send the response
        res.status(200).json(combined);
        
    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: "Failed to load brewery data" });
    }
}