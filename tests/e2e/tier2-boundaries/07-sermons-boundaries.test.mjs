import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 2 - Boundary 07: Sermones Corner Cases & Chat Boundaries', () => {
  it('T2-F07-01: Sermon search displays dedicated empty state when no sermons match', () => {
    assert.ok(fileExists('src/app/sermons/page.tsx'), 'sermons/page.tsx must exist');
    const content = readFile('src/app/sermons/page.tsx');
    assert.match(
      content,
      /length === 0|length == 0|no se encontraron|empty/i,
      'sermons/page.tsx must provide empty search result presentation'
    );
  });

  it('T2-F07-02: Sermon detail handles invalid or missing sermon ID gracefully', () => {
    assert.ok(fileExists('src/app/sermons/[id]/page.tsx'), 'sermons/[id]/page.tsx must exist');
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.match(content, /error|not found|no encontrado|loading/i, 'sermons/[id]/page.tsx must handle load failure');
  });

  it('T2-F07-03: Sermon chat input prevents empty string or whitespace-only messages', () => {
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.match(
      content,
      /\.trim\(\)|disabled={!|disabled={\s*!/,
      'sermons/[id]/page.tsx should validate chat message before sending'
    );
  });

  it('T2-F07-04: Sermon sharing flow generates shareable token or link', () => {
    const content = readFile('src/app/sermons/[id]/page.tsx');
    const hasSharing = /share|compartir|clipboard|navigator\.clipboard/i.test(content);
    assert.ok(hasSharing, 'sermons/[id]/page.tsx should provide sermon sharing feature');
  });

  it('T2-F07-05: Chat messages use theme-adaptive color tokens instead of static colors', () => {
    const content = readFile('src/app/sermons/[id]/page.tsx');
    // Ensure chat bubbles avoid hardcoded dark text on dark backgrounds or hardcoded green
    assert.doesNotMatch(content, /#DCF8C6/i, 'sermons/[id]/page.tsx must not hardcode #DCF8C6');
    assert.match(
      content,
      /bg-card|bg-muted|bg-primary|bg-secondary|bg-selapp|border/i,
      'sermons/[id]/page.tsx chat bubbles must use semantic or brand classes'
    );
  });
});
