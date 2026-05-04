 "APPONAUG BREWING": { lat: 41.7028, lng: -71.4475, url: "https://apponaugbrewing.com/", tapListUrl: "https://apponaugbrewing.com/warwick-apponaug-brewing-menus#:~:text=On%20Tap%20Today",logo: "/logos/apponaug.png", hours: ["12-8pm", "Closed", "4-10pm", "4-10pm", "4-10pm", "4-11pm", "12-11pm"], hasKitchen: true }
        
    };
// Example logic for your "View Tap List" button
const showMenu = (breweryName) => {
    if (breweryName === "UNCOMMON PAIR BREWING") {
        // Fetch the data from your new JSON file
        const menu = require('./data/uncommon-pair-menu.json');
        alert("On Tap: " + menu.beers.join(", "));
    }
};

   const normalize = (d) => {
        if (!d) return "";
        const match = d.trim().match(/^(\d{1,2})\/(\d{1,2})/);
        if (match) return `${Number(match[1])}/${Number(match[2])}`;
        return "";
