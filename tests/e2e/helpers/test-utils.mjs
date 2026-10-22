import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

export const ROOT_DIR = process.cwd();

export function resolvePath(...segments) {
  return path.resolve(ROOT_DIR, ...segments);
}

export function fileExists(relPath) {
  const fullPath = resolvePath(relPath);
  return fs.existsSync(fullPath);
}

export function readFile(relPath) {
  const fullPath = resolvePath(relPath);
  if (!fs.existsSync(fullPath)) {
    return null;
  }
  return fs.readFileSync(fullPath, 'utf-8');
}

export function readJson(relPath) {
  const content = readFile(relPath);
  if (!content) return null;
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse JSON in ${relPath}: ${err.message}`);
  }
}

export function extractCSSVariables(cssContent, selector = ':root') {
  if (!cssContent) return {};
  const variables = {};
  
  // Normalize selector regex
  const escapedSelector = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const selectorRegex = new RegExp(`${escapedSelector}\\s*\\{([^}]+)\\}`, 'g');
  
  let match;
  while ((match = selectorRegex.exec(cssContent)) !== null) {
    const blockContent = match[1];
    const lines = blockContent.split(';');
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 2) {
        const varName = parts[0].trim();
        const varValue = parts.slice(1).join(':').trim();
        if (varName.startsWith('--')) {
          variables[varName] = varValue;
        }
      }
    }
  }
  return variables;
}

export function scanFilesForPattern(relDir, regex, extensions = ['.ts', '.tsx', '.js', '.jsx']) {
  const fullDir = resolvePath(relDir);
  if (!fs.existsSync(fullDir)) return [];
  
  const matches = [];
  
  function walk(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullEntryPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
          walk(fullEntryPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          const content = fs.readFileSync(fullEntryPath, 'utf-8');
          const lines = content.split('\n');
          for (let i = 0; i < lines.length; i++) {
            if (regex.test(lines[i])) {
              matches.push({
                file: path.relative(ROOT_DIR, fullEntryPath).replace(/\\/g, '/'),
                lineNumber: i + 1,
                lineContent: lines[i].trim()
              });
            }
          }
        }
      }
    }
  }
  
  walk(fullDir);
  return matches;
}

export function assertTokenDefined(variables, tokenName, context = '') {
  assert.ok(
    tokenName in variables,
    `Expected CSS variable '${tokenName}' to be defined in ${context}. Found: ${Object.keys(variables).join(', ') || 'none'}`
  );
}

export function assertNoForbiddenPattern(relDir, forbiddenRegex, description, extensions = ['.ts', '.tsx']) {
  const matches = scanFilesForPattern(relDir, forbiddenRegex, extensions);
  assert.strictEqual(
    matches.length,
    0,
    `Found forbidden pattern (${description}) in ${matches.length} location(s):\n` +
      matches.map(m => `  ${m.file}:${m.lineNumber}: ${m.lineContent}`).join('\n')
  );
}
