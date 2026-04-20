const fs = require('fs');
const path = require('path');

export default function handler(req, res) {
    const paths = {
        phantom: path.join(process.cwd(), 'phantom-data.json'),
        ragged: path.join(process.cwd(), 'ragged-data.json'),
        crafted: path.join(process.cwd(), 'crafted-hope-data.json'),
        manual: path.join(process.cwd(), 'manual-data.json')
    };

    try {
        const phantomData = fs.existsSync(paths.phantom) ? JSON.parse(fs.readFileSync(paths.phantom, 'utf8')) : [];
        const raggedData = fs.existsSync(paths.ragged) ? JSON.parse(fs.readFileSync(paths.ragged, 'utf8')) : [];
        const craftedData = fs.existsSync(paths.crafted) ? JSON.parse(fs.readFileSync(paths.crafted, 'utf8')) : [];
        
        // This is the manual data from your file
        let manualData = fs.existsSync(paths.manual) ? JSON.parse(fs.readFileSync(paths.manual, 'utf8')) : [];

        // DEBUG OVERRIDE: If the file isn't found, we force the entry here
        if (manualData.length === 0) {
            manualData = [{
                "brewery": "BRAVO BREWING COMPANY",
                "truck": "DEBUG: 75¢ wings (Hardcoded)",
                "start": "04/20/2026 5:00PM",
                "end": "04/20/2026 11:00PM",
                "hasKitchen": true
            }];
        }

        const combined = [
            ...phantomData.map(item => ({ ...item, brewery: "PHANTOM FARMS" })),
            ...raggedData.map(item => ({ ...item, brewery: "RAGGED ISLAND" })),
            ...craftedData.map(item => ({ ...item, brewery: "CRAFTED HOPE BREWING" })),
            ...manualData 
        ];

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
        res.status(500).json({ error: "API Failure", details: error.message });
    }
}