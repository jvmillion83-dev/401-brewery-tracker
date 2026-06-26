from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import json
import os

def scrape_menu():
    url = "https://bravobrewingcompany.com/" 
    
    # 1. Use Playwright to launch a browser
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(url)
        
        # Wait for the content to load
        page.wait_for_selector(".menu-item")
        
        # Get the full page content
        html = page.content()
        browser.close()
    
    # 2. Parse the HTML content
    soup = BeautifulSoup(html, 'html.parser')
    
    # 3. Find all beer containers
    items = soup.select('.menu-item')
    print(f"Total menu items found: {len(items)}")
    
    menu_items = []
    
    # 4. Loop through items
    for item in items:
        name_el = item.select_one('.item-name span')
        style_el = item.select_one('.item-category')
        abv_el = item.select_one('.item-abv')
        desc_el = item.select_one('.item-description p')

        name = name_el.get_text(strip=True) if name_el else "N/A"
        style = style_el.get_text(strip=True) if style_el else "N/A"
        abv = abv_el.get_text(strip=True) if abv_el else "N/A"
        description = desc_el.get_text(strip=True) if desc_el else ""

        menu_items.append({
            "name": name,
            "style": style,
            "abv": abv,
            "description": description
        })

    # 5. Save to your app's public data folder
    output_dir = os.path.join('..', 'public', 'data')
    os.makedirs(output_dir, exist_ok=True)
    
    output_path = os.path.join(output_dir, 'bravo_menu.json')
    
    with open(output_path, 'w') as f:
        json.dump({"On Tap": menu_items, "lastUpdated": "6/26/2026"}, f, indent=2)
    
    print(f"Menu saved successfully to {output_path}")

# This must be at the very bottom, aligned to the far left
if __name__ == "__main__":
    scrape_menu()