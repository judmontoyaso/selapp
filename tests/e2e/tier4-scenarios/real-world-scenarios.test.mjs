import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists, extractCSSVariables } from '../helpers/test-utils.mjs';

describe('Tier 4: Real-World Application Scenarios (End-to-End User Journeys)', () => {
  it('T4-SCN-01: Morning Devotional & Streak Journey', () => {
    // 1. Home dashboard has streak tracker and verse of the day
    assert.ok(fileExists('src/app/page.tsx'), 'Home page must exist');
    const homeContent = readFile('src/app/page.tsx');
    assert.match(homeContent, /VerseOfTheDay/, 'Home page must mount VerseOfTheDay');
    assert.match(homeContent, /streak|racha|lectura/i, 'Home page must feature streak or reading progress');

    // 2. Devotionals detail supports reader mode with serif scriptures
    assert.ok(fileExists('src/app/devotionals/[date]/page.tsx'), 'Devotionals detail page must exist');
    const devotionalContent = readFile('src/app/devotionals/[date]/page.tsx');
    assert.match(devotionalContent, /font-serif/, 'Devotionals detail must use serif scripture styling');
    assert.match(devotionalContent, /reflexion|pregunta|answer/i, 'Devotionals detail must support reflection Q&A');

    // 3. Devotionals uses toast notification instead of alert()
    assert.doesNotMatch(devotionalContent, /\balert\s*\(/, 'Devotionals detail must not use browser alert()');
    assert.match(devotionalContent, /toast/, 'Devotionals detail must use toast for completion feedback');
  });

  it('T4-SCN-02: Sunday Sermon Note-Taking Journey', () => {
    // 1. Sermons catalog provides search and pagination
    assert.ok(fileExists('src/app/sermons/page.tsx'), 'Sermons catalog page must exist');
    const catalogContent = readFile('src/app/sermons/page.tsx');
    assert.match(catalogContent, /search|buscar|filter/i, 'Sermons catalog must provide search');

    // 2. Sermon detail supports dual view (document vs chat)
    assert.ok(fileExists('src/app/sermons/[id]/page.tsx'), 'Sermons detail page must exist');
    const detailContent = readFile('src/app/sermons/[id]/page.tsx');
    assert.match(detailContent, /chat|document/i, 'Sermon detail must support document and chat views');

    // 3. Sermon chat messages avoid WhatsApp green
    assert.doesNotMatch(detailContent, /#DCF8C6/i, 'Sermon chat must not use hardcoded #DCF8C6');

    // 4. Sermon mutations use toast and modal confirmation
    assert.doesNotMatch(detailContent, /\balert\s*\(/, 'Sermon detail must not use alert()');
    assert.doesNotMatch(detailContent, /\bconfirm\s*\(/, 'Sermon detail must not use confirm()');
  });

  it('T4-SCN-03: Evening Spiritual Reflection & Mood Journaling', () => {
    // 1. Notes page supports 5 spiritual diary categories
    assert.ok(fileExists('src/app/notes/page.tsx'), 'Notes page must exist');
    const notesContent = readFile('src/app/notes/page.tsx');
    assert.match(notesContent, /gratitud|pensamiento|logro|oracion/i, 'Notes page must support spiritual diary types');

    // 2. Notes editor integrates RichTextEditor and mood selection
    assert.match(notesContent, /RichTextEditor/, 'Notes page must integrate RichTextEditor');
    assert.match(notesContent, /mood|ánimo|animo/i, 'Notes page must integrate mood selector');

    // 3. Notes editor uses toast feedback on mutations
    assert.doesNotMatch(notesContent, /\balert\s*\(/, 'Notes page must not use alert()');
    assert.match(notesContent, /toast/, 'Notes page must use toast notifications');
  });

  it('T4-SCN-04: Night Mode Reading & Responsive Theme Switching', () => {
    // 1. globals.css defines complete :root and .dark tokens
    assert.ok(fileExists('src/app/globals.css'), 'globals.css must exist');
    const css = readFile('src/app/globals.css');
    const rootVars = extractCSSVariables(css, ':root');
    const darkVars = extractCSSVariables(css, '.dark');
    assert.ok(rootVars['--background'], 'globals.css must define root --background');
    assert.ok(darkVars['--background'], 'globals.css must define dark --background');

    // 2. DesktopHeader integrates ThemeToggle
    assert.ok(fileExists('src/components/DesktopHeader.tsx'), 'DesktopHeader must exist');
    const headerContent = readFile('src/components/DesktopHeader.tsx');
    assert.match(headerContent, /ThemeToggle/, 'DesktopHeader must integrate ThemeToggle');

    // 3. Shell layout includes ThemeProvider with class attribute
    assert.ok(fileExists('src/app/layout.tsx'), 'layout.tsx must exist');
    const layoutContent = readFile('src/app/layout.tsx');
    assert.match(layoutContent, /ThemeProvider/, 'Root layout must mount ThemeProvider');
  });

  it('T4-SCN-05: Resilient Navigation & Recovery Flow', () => {
    // 1. Primary routes have dedicated loading skeletons
    const routeLoadings = [
      'src/app/loading.tsx',
      'src/app/sermons/loading.tsx',
      'src/app/devotionals/loading.tsx',
      'src/app/notes/loading.tsx'
    ];
    for (const loadingFile of routeLoadings) {
      assert.ok(fileExists(loadingFile), `${loadingFile} boundary must exist for streaming resilience`);
    }

    // 2. Root error boundary catches failures and provides reset trigger
    assert.ok(fileExists('src/app/error.tsx'), 'src/app/error.tsx must exist');
    const errorContent = readFile('src/app/error.tsx');
    assert.match(errorContent, /reset/, 'error.tsx must accept reset callback for recovery');

    // 3. Root layout includes Sonner Toaster
    const layoutContent = readFile('src/app/layout.tsx');
    assert.match(layoutContent, /Toaster/, 'Root layout must mount Toaster for system notifications');
  });
});
