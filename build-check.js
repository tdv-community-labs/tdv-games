// TDV Community Labs - Games Verification Test Suite
// Verifies HTML5, dual-theme zinc tokens, TDV Royal Purple brand, and JS syntax

const fs = require('fs');
const path = require('path');
const vm = require('vm');

console.log('⚡ Starting TDV Games build verification...\n');

let passCount = 0;
let failCount = 0;

function check(title, fn) {
  try {
    const result = fn();
    if (result === false) {
      console.error(`❌ FAIL: ${title}`);
      failCount++;
    } else {
      console.log(`✓ PASS: ${title}`);
      passCount++;
    }
  } catch (err) {
    console.error(`❌ ERROR: ${title} - ${err.message}`);
    failCount++;
  }
}

// 1. Check index.html doctype and language
check('index.html contains valid HTML5 doctype and lang tag', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  return html.includes('<!DOCTYPE html>') && html.includes('lang="az"');
});

// 2. Check Dual Theme tokens (zinc-50 / zinc-950)
check('index.html uses zinc-50 and zinc-950 dual theme tokens', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  return html.includes('bg-zinc-50') && html.includes('dark:bg-zinc-950') && html.includes('#09090b') && html.includes('#fafafa');
});

// 3. Check TDV Royal Purple brand palette
check('index.html configures TDV Royal Purple brand palette', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  return html.includes('#9333ea') && html.includes('#7e22ce') && html.includes('#a855f7');
});

// 4. Check TDV Crest asset references
check('assets/tdv-logo.png exists and is referenced in index.html', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const assetExists = fs.existsSync(path.join(__dirname, 'assets', 'tdv-logo.png'));
  return assetExists && html.includes('assets/tdv-logo.png');
});

// 5. Check Ecosystem Bar presence
check('index.html contains unified TDV ecosystem topbar with all platforms', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  return html.includes('tdv-ecosystem-topbar') &&
    html.includes('https://tdv-community-hubs.vercel.app/') &&
    html.includes('https://tdv-e-school.vercel.app/') &&
    html.includes('https://school-minifootball-tournament.vercel.app/');
});

// 6. Check vercel.json
check('vercel.json is valid JSON with security headers', () => {
  const json = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
  return json.version === 2 && Array.isArray(json.headers);
});

// 7. Check inline JavaScript syntax
check('inline client JavaScript parses with zero syntax errors', () => {
  const html = fs.readFileSync('index.html', 'utf8');
  const scriptRegex = /<script(?![^>]*src=)[^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptIndex = 0;
  while ((match = scriptRegex.exec(html)) !== null) {
    const code = match[1];
    if (code.trim().length > 0) {
      new vm.Script(code, { filename: `inline-script-${scriptIndex++}.js` });
    }
  }
  return true;
});

console.log(`\n✨ Verification Complete: ${passCount} passed, ${failCount} failed.`);
if (failCount > 0) {
  process.exit(1);
}
