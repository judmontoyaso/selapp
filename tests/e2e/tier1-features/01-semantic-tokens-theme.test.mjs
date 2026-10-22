import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists, extractCSSVariables, assertTokenDefined } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 01: Semantic Tokens & Dark Mode', () => {
  const REQUIRED_TOKENS = [
    '--background',
    '--foreground',
    '--card',
    '--card-foreground',
    '--popover',
    '--popover-foreground',
    '--primary',
    '--primary-foreground',
    '--secondary',
    '--secondary-foreground',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--accent-foreground',
    '--destructive',
    '--destructive-foreground',
    '--border',
    '--input',
    '--ring',
    '--radius'
  ];

  it('T1-F01-01: globals.css defines semantic CSS variables in :root', () => {
    assert.ok(fileExists('src/app/globals.css'), 'src/app/globals.css must exist');
    const css = readFile('src/app/globals.css');
    const rootVars = extractCSSVariables(css, ':root');
    for (const token of REQUIRED_TOKENS) {
      assertTokenDefined(rootVars, token, ':root in globals.css');
    }
  });

  it('T1-F01-02: globals.css defines corresponding .dark semantic CSS variables', () => {
    assert.ok(fileExists('src/app/globals.css'), 'src/app/globals.css must exist');
    const css = readFile('src/app/globals.css');
    const darkVars = extractCSSVariables(css, '.dark');
    // Dark mode requires all core color tokens
    const colorTokens = REQUIRED_TOKENS.filter(t => t !== '--radius');
    for (const token of colorTokens) {
      assertTokenDefined(darkVars, token, '.dark in globals.css');
    }
  });

  it('T1-F01-03: tailwind.config.ts configures darkMode: ["class"]', () => {
    assert.ok(fileExists('tailwind.config.ts'), 'tailwind.config.ts must exist');
    const config = readFile('tailwind.config.ts');
    assert.match(
      config,
      /darkMode:\s*(\["class"\]|'class'|"class")/,
      'tailwind.config.ts must specify darkMode: ["class"]'
    );
  });

  it('T1-F01-04: ThemeProvider component exists and configures next-themes', () => {
    const exists = fileExists('src/components/ThemeProvider.tsx');
    assert.ok(exists, 'src/components/ThemeProvider.tsx must exist');
    const content = readFile('src/components/ThemeProvider.tsx');
    assert.match(content, /next-themes/, 'ThemeProvider must import next-themes');
    assert.match(content, /ThemeProvider/, 'ThemeProvider must export a ThemeProvider wrapper');
  });

  it('T1-F01-05: Root layout.tsx mounts ThemeProvider with suppressHydrationWarning', () => {
    assert.ok(fileExists('src/app/layout.tsx'), 'src/app/layout.tsx must exist');
    const layout = readFile('src/app/layout.tsx');
    assert.match(layout, /<ThemeProvider[\s\S]*?>/, 'src/app/layout.tsx must mount <ThemeProvider>');
    assert.match(
      layout,
      /<html[\s\S]*?suppressHydrationWarning/,
      '<html ...> in layout.tsx must include suppressHydrationWarning'
    );
  });
});
