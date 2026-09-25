import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

css_match = re.search(r'<style>(.*?)</style>', content, flags=re.DOTALL)
if css_match:
    with open('styles/games-main.css', 'w', encoding='utf-8') as f:
        f.write(css_match.group(1).strip())

script_pattern = re.compile(r'<script.*?>(.*?)</script>', re.DOTALL)
js_content = ""
for match in script_pattern.finditer(content):
    script_text = match.group(1).strip()
    if 'tailwind.config' in script_text or 'localStorage.getItem' in script_text:
        # Keep FOUC and tailwind config out of the extracted JS
        # Wait, the auth logic ALSO uses localStorage.getItem, we must be careful.
        if 'initTDVEcosystemSSO' not in script_text:
            continue
    if script_text:
        js_content += script_text + "\n\n"

with open('scripts/games-ui.js', 'w', encoding='utf-8') as f:
    f.write(js_content)
