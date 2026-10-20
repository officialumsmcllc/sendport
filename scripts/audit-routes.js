const fs = require('fs');
const path = require('path');

function getFiles(dir, exts) {
  let results = [];
  try {
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        if (file !== 'node_modules' && file !== '.next' && file !== '.git') {
          results = results.concat(getFiles(fullPath, exts));
        }
      } else {
        if (exts.some(ext => file.endsWith(ext))) {
          results.push(fullPath);
        }
      }
    }
  } catch (e) {}
  return results;
}

// 1. Collect all app routes
const appDir = path.resolve('app');
const pageFiles = getFiles(appDir, ['page.tsx', 'page.jsx', 'page.js', 'route.ts', 'route.js']);
const knownRoutes = new Set();

pageFiles.forEach(f => {
  let rel = path.relative(appDir, f).replace(/\\/g, '/');
  rel = rel.replace(/\/(page|route)\.(tsx|jsx|js|ts)$/, '');
  if (rel === 'page.tsx' || rel === 'page.jsx' || rel === 'route.ts' || rel === 'route.js') rel = '';
  knownRoutes.add('/' + rel);
});

console.log('Known page/route count:', knownRoutes.size);

// 2. Find all internal links
const allTsx = getFiles(path.resolve('.'), ['.tsx', '.ts']);
const linkRegex = /href=["'](\/[^"'#?]*)/g;
const linksFound = new Map();

allTsx.forEach(f => {
  if (f.includes('.next') || f.includes('node_modules') || f.includes('audit-routes.js')) return;
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = linkRegex.exec(content)) !== null) {
    const link = match[1];
    if (!linksFound.has(link)) linksFound.set(link, new Set());
    linksFound.get(link).add(path.relative(path.resolve('.'), f).replace(/\\/g, '/'));
  }
});

console.log('Unique internal links found:', linksFound.size);

// 3. Find all fetch calls (both string and template literal)
const fetchRegex = /fetch\(\s*["'`](\/[^"'`?]+)/g;
const fetchFound = new Map();

allTsx.forEach(f => {
  if (f.includes('.next') || f.includes('node_modules') || f.includes('audit-routes.js')) return;
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = fetchRegex.exec(content)) !== null) {
    let target = match[1];
    // If it's a template literal with ${...}, extract the static prefix or pattern
    if (target.includes('${')) {
      target = target.replace(/\$\{[^}]+\}/g, 'PLACEHOLDER');
    }
    if (!fetchFound.has(target)) fetchFound.set(target, new Set());
    fetchFound.get(target).add(path.relative(path.resolve('.'), f).replace(/\\/g, '/'));
  }
});

// 4. Find all router.push and window.location
const navRegex = /(?:router\.push|window\.location(?:\.href)?\s*=)\s*\(?\s*["'`](\/[^"'`?]+)/g;
const navFound = new Map();

allTsx.forEach(f => {
  if (f.includes('.next') || f.includes('node_modules') || f.includes('audit-routes.js')) return;
  const content = fs.readFileSync(f, 'utf8');
  let match;
  while ((match = navRegex.exec(content)) !== null) {
    let target = match[1];
    if (target.includes('${')) {
      target = target.replace(/\$\{[^}]+\}/g, 'PLACEHOLDER');
    }
    if (!navFound.has(target)) navFound.set(target, new Set());
    navFound.get(target).add(path.relative(path.resolve('.'), f).replace(/\\/g, '/'));
  }
});

console.log('Unique fetch calls found:', fetchFound.size);
console.log('Unique programmatic navigations found:', navFound.size);

function checkRoute(target) {
  const clean = target.endsWith('/') && target.length > 1 ? target.slice(0, -1) : target;
  if (knownRoutes.has(clean)) return true;
  for (const r of knownRoutes) {
    const pattern = '^' + r.replace(/\[\.\.\.[^\]]+\]/g, '.*').replace(/\[[^\]]+\]/g, '[^/]+') + '$';
    const testTarget = clean.replace(/PLACEHOLDER/g, 'test-id');
    if (new RegExp(pattern).test(testTarget)) return true;
  }
  return false;
}

const brokenLinks = [];
for (const [link, files] of linksFound.entries()) {
  if (!checkRoute(link)) {
    brokenLinks.push({ link, files: Array.from(files) });
  }
}

const brokenFetches = [];
for (const [target, files] of fetchFound.entries()) {
  if (!checkRoute(target)) {
    brokenFetches.push({ target, files: Array.from(files) });
  }
}

const brokenNavs = [];
for (const [target, files] of navFound.entries()) {
  if (!checkRoute(target)) {
    brokenNavs.push({ target, files: Array.from(files) });
  }
}

console.log('\n=============================');
console.log('--- POTENTIALLY BROKEN LINKS ---');
console.log(JSON.stringify(brokenLinks, null, 2));

console.log('\n=============================');
console.log('--- POTENTIALLY BROKEN FETCHES ---');
console.log(JSON.stringify(brokenFetches, null, 2));

console.log('\n=============================');
console.log('--- POTENTIALLY BROKEN NAVIGATIONS ---');
console.log(JSON.stringify(brokenNavs, null, 2));

