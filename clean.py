import re

def process_file(filename, css_file, js_file):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # CSS Replace
    content = re.sub(
        r'<style>.*?</style>',
        f'<link rel="stylesheet" href="styles/{css_file}">',
        content,
        flags=re.DOTALL
    )
    
    script_pattern = re.compile(r'<script.*?>.*?</script>', re.DOTALL)
    
    def script_repl(match):
        script_content = match.group(0)
        if 'tailwind.config' in script_content or 'localStorage.getItem' in script_content:
            return script_content # keep
        if 'src=' in script_content and ('tailwindcss.com' in script_content or 'lucide' in script_content):
            return script_content # keep
        return '' # remove inline

    content = script_pattern.sub(script_repl, content)
    
    if f'src="scripts/{js_file}"' not in content:
        content = content.replace('</body>', f'  <script src="scripts/{js_file}" defer></script>\n</body>')

    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Cleaned {filename}")

process_file('index.html', 'games-main.css', 'games-ui.js')
