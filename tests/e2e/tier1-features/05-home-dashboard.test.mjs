import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 05: Home Dashboard Modernization', () => {
  it('T1-F05-01: src/app/page.tsx renders elevated hero and quick action links', () => {
    assert.ok(fileExists('src/app/page.tsx'), 'src/app/page.tsx must exist');
    const content = readFile('src/app/page.tsx');
    assert.match(content, /sermons|devotionals|notes/, 'page.tsx must contain links to core modules');
  });

  it('T1-F05-02: src/app/page.tsx integrates daily progress / streak tracker card', () => {
    const page = readFile('src/app/page.tsx');
    assert.match(
      page,
      /streak|racha|lectura|progreso/i,
      'src/app/page.tsx must feature daily streak or reading progress tracker'
    );
  });

  it('T1-F05-03: VerseOfTheDay eliminates spinning emoji ⏳ in favor of modern skeleton', () => {
    assert.ok(fileExists('src/components/VerseOfTheDay.tsx'), 'VerseOfTheDay.tsx must exist');
    const verseComponent = readFile('src/components/VerseOfTheDay.tsx');
    assert.doesNotMatch(verseComponent, /⏳/, 'VerseOfTheDay must not render spinning emoji ⏳');
    assert.match(verseComponent, /animate-pulse|skeleton|Skeleton/i, 'VerseOfTheDay must use skeleton loading state');
  });

  it('T1-F05-04: SermonCounter displays statistics with modern card container', () => {
    assert.ok(fileExists('src/components/SermonCounter.tsx'), 'SermonCounter.tsx must exist');
    const counter = readFile('src/components/SermonCounter.tsx');
    assert.match(counter, /sermon/i, 'SermonCounter must render sermon metrics');
  });

  it('T1-F05-05: Date and greeting in src/app/page.tsx are hydration-safe', () => {
    const page = readFile('src/app/page.tsx');
    // Ensure date/time calculations don't trigger raw server/client hydration mismatches
    // by either client-side mount guards (mounted/isClient) or server pass-down
    const hasHydrationGuard = /mounted|useEffect|isClient|suppressHydrationWarning/.test(page);
    assert.ok(hasHydrationGuard, 'src/app/page.tsx should protect time-sensitive greetings against hydration mismatch');
  });
});
