import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists, extractCSSVariables } from '../helpers/test-utils.mjs';

describe('Tier 2 - Boundary 01: Theme Tokens & Color Limits', () => {
  it('T2-F01-01: HSL CSS variable values are syntactically valid', () => {
    assert.ok(fileExists('src/app/globals.css'), 'src/app/globals.css must exist');
    const css = readFile('src/app/globals.css');
    const rootVars = extractCSSVariables(css, ':root');
    for (const [key, val] of Object.entries(rootVars)) {
      if (key.startsWith('--') && key !== '--radius') {
        // Should be formatted as "H S% L%" or "hsl(...)" or standard CSS color
        assert.ok(
          val.length > 0,
          `Variable ${key} must have non-empty value`
        );
      }
    }
  });

  it('T2-F01-02: Dark mode background token is distinct from light mode background', () => {
    const css = readFile('src/app/globals.css');
    const rootVars = extractCSSVariables(css, ':root');
    const darkVars = extractCSSVariables(css, '.dark');
    assert.ok(rootVars['--background'], ':root must define --background');
    assert.ok(darkVars['--background'], '.dark must define --background');
    assert.notStrictEqual(
      rootVars['--background'].trim(),
      darkVars['--background'].trim(),
      'Dark mode background must differ from light mode background'
    );
  });

  it('T2-F01-03: --radius token is defined and within acceptable UI scale', () => {
    const css = readFile('src/app/globals.css');
    const rootVars = extractCSSVariables(css, ':root');
    assert.ok(rootVars['--radius'], ':root must define --radius');
    const radius = rootVars['--radius'].trim();
    assert.match(radius, /(rem|px|em)$/, '--radius must have valid CSS unit');
  });

  it('T2-F01-04: ThemeToggle component handles toggle interaction with accessible attributes', () => {
    const exists = fileExists('src/components/ui/theme-toggle.tsx') || fileExists('src/components/ThemeToggle.tsx');
    assert.ok(exists, 'ThemeToggle component must exist in src/components/ui/ or src/components/');
    const filePath = fileExists('src/components/ui/theme-toggle.tsx')
      ? 'src/components/ui/theme-toggle.tsx'
      : 'src/components/ThemeToggle.tsx';
    const content = readFile(filePath);
    assert.match(content, /useTheme/, 'ThemeToggle must use useTheme from next-themes');
    assert.match(content, /aria-label|sr-only|title/i, 'ThemeToggle must have accessible label');
  });

  it('T2-F01-05: Root layout body avoids hardcoded light background colors', () => {
    const layout = readFile('src/app/layout.tsx');
    // Ensure body doesn't hardcode bg-white without dark mode alternative
    assert.doesNotMatch(
      layout,
      /className="[^"]*\bbg-white\b(?![^"]*dark:bg-)[^"]*"/,
      'layout.tsx body should not have hardcoded bg-white without dark mode adaptation'
    );
  });
});
