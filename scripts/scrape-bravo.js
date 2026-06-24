import requests
from bs4 import BeautifulSoup
import json
from datetime import datetime

def scrape_bravo_menu():
    url = "https://bravobrewingcompany.com/"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')
    
    menu_sections = []
    
    # Target each menu section (On Tap, Guest Taps)
    sections = soup.find_all('div', class_='section')
    
    for section in sections:
        header = section.find('h3', class_='section-name')
        if not header:
            continue
            
        section_data = {
            "header": header.get_text(strip=True),
            "items": []
        }
        
        # Target each menu item within the section
        items = section.find_all('div', class_='menu-item')
        for item in items:
            beer_data = {
                "name": item.find('span', id=lambda x: x and 'description' not in x).get_text(strip=True) if item.find('span', id=lambda x: x and 'description' not in x) else "N/A",
                "style": item.find('span', class_='item-category').get_text(strip=True) if item.find('span', class_='item-category') else "",
                "abv": item.find('span', class_='item-abv').get_text(strip=True) if item.find('span', class_='item-abv') else "",
                "description": item.find('p', class_='show-less').get_text(strip=True) if item.find('p', class_='show-less') else ""
            }
            section_data["items"].append(beer_data)
            
        menu_sections.append(section_data)
    
    # Final structure for your JSON file
    final_output = {
        "Beer on tap": menu_sections,
        "lastUpdated": datetime.now().strftime("%m/%d/%Y, %I:%M:%S %p")
    }
    
    return json.dumps(final_output, indent=2)

# Run the scrape and save to file
with open('public/data/bravo_menu.json', 'w') as f:
    f.write(scrape_bravo_menu())