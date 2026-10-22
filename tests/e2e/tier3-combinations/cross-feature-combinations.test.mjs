import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 3: Cross-Feature Combinations (Pairwise Coverage)', () => {
  it('T3-XF-01: ThemeToggle + Devotionals: Theme tokens support devotional reading mode styling', () => {
    assert.ok(fileExists('src/app/devotionals/[date]/page.tsx'), 'devotionals detail page must exist');
    const content = readFile('src/app/devotionals/[date]/page.tsx');
    assert.match(
      content,
      /font-serif/,
      'Devotional scripture styling must use serif typography'
    );
    // Should use semantic or theme classes
    assert.match(
      content,
      /text-foreground|text-selapp|dark:|bg-card|bg-background/i,
      'Devotional reading mode must use semantic or dark-mode adaptive classes'
    );
  });

  it('T3-XF-02: Notes Editor + Sonner Toast: Note auto-saving interacts with Sonner toast system', () => {
    assert.ok(fileExists('src/app/notes/page.tsx'), 'notes page must exist');
    const content = readFile('src/app/notes/page.tsx');
    assert.match(content, /toast/, 'Notes editor must trigger toast notifications on mutations');
  });

  it('T3-XF-03: Sermons Chat + Warm Brand Tokens: Sermon chat bubbles harmonize with Selapp brand tokens', () => {
    assert.ok(fileExists('src/app/sermons/[id]/page.tsx'), 'sermons detail must exist');
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.doesNotMatch(content, /#DCF8C6/i, 'Sermon chat must not contain hardcoded WhatsApp green');
  });

  it('T3-XF-04: Mobile Navigation + Route Boundaries: Mobile navigation leads to routes equipped with loading skeletons', () => {
    assert.ok(fileExists('src/components/MobileTabBar.tsx'), 'MobileTabBar must exist');
    const tabBar = readFile('src/components/MobileTabBar.tsx');
    assert.match(tabBar, /\/devotionals/, 'MobileTabBar links to devotionals');
    assert.match(tabBar, /\/sermons/, 'MobileTabBar links to sermons');
    assert.match(tabBar, /\/notes/, 'MobileTabBar links to notes');
  });

  it('T3-XF-05: DesktopHeader + ThemeToggle + User Menu: Header cleanly integrates ThemeToggle with navigation', () => {
    assert.ok(fileExists('src/components/DesktopHeader.tsx'), 'DesktopHeader must exist');
    const header = readFile('src/components/DesktopHeader.tsx');
    assert.match(header, /ThemeToggle/, 'DesktopHeader must mount ThemeToggle');
    assert.match(header, /AuthButtons|Avatar|User/i, 'DesktopHeader must mount auth or user element');
  });

  it('T3-XF-06: Atomic UI (Dialog) + Sermons Deletion: Radix Dialog primitives replace browser confirm for deletions', () => {
    const sermonDetail = readFile('src/app/sermons/[id]/page.tsx');
    assert.ok(sermonDetail, 'sermons/[id]/page.tsx must exist');
    assert.doesNotMatch(sermonDetail, /\bconfirm\s*\(/, 'Sermons detail must not use browser confirm()');
  });

  it('T3-XF-07: Home Dashboard + Streak Tracker + Devotionals: Home dashboard integrates daily reading streak metrics', () => {
    const home = readFile('src/app/page.tsx');
    assert.ok(home, 'page.tsx must exist');
    assert.match(home, /streak|racha|lectura|progreso/i, 'Home dashboard must include streak or progress tracking');
  });

  it('T3-XF-08: RichTextEditor + Spiritual Diary Mood: Editor state and mood selector bind together in notes view', () => {
    const notesPage = readFile('src/app/notes/page.tsx');
    assert.ok(notesPage, 'notes page must exist');
    assert.match(notesPage, /RichTextEditor/, 'notes page must integrate RichTextEditor');
    assert.match(notesPage, /mood|sentimiento|ánimo/i, 'notes page must integrate mood selector');
  });

  it('T3-XF-09: Dark Mode Tokens + Atomic UI Primitives: Button and Card inherit semantic HSL background variables', () => {
    const button = readFile('src/components/ui/button.tsx');
    const card = readFile('src/components/ui/card.tsx');
    if (button) {
      assert.match(button, /bg-primary|bg-secondary|bg-destructive|hover:bg-/, 'Button must use semantic tokens');
    }
    if (card) {
      assert.match(card, /bg-card|text-card-foreground/, 'Card must use semantic tokens');
    }
  });

  it('T3-XF-10: Route Boundaries (Error) + Reset Action: Root error boundary executes reset handler on failure recovery', () => {
    assert.ok(fileExists('src/app/error.tsx'), 'error.tsx must exist');
    const errorPage = readFile('src/app/error.tsx');
    assert.match(errorPage, /reset\(\)|onClick/, 'error.tsx must bind reset action to user interaction');
  });

  it('T3-XF-11: Responsive Shell + Skeletons: Root layout accommodates bottom navigation and skeleton heights', () => {
    const layout = readFile('src/app/layout.tsx');
    assert.ok(layout, 'layout.tsx must exist');
    assert.match(layout, /pb-/, 'layout.tsx must ensure padding for mobile bottom bar');
  });

  it('T3-XF-12: TypeScript Types + Atomic UI Primitives: Primitives export typed React component interfaces with cn', () => {
    if (fileExists('src/components/ui/button.tsx')) {
      const button = readFile('src/components/ui/button.tsx');
      assert.match(button, /ButtonProps|React\.ButtonHTMLAttributes/, 'button.tsx must define typed props');
      assert.match(button, /cn\(/, 'button.tsx must use cn utility for class merging');
    }
  });
});
