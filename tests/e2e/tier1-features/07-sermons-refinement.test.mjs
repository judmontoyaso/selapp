import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 07: Sermones Experience Refinement', () => {
  it('T1-F07-01: src/app/sermons/page.tsx renders sermon catalog with search and filters', () => {
    assert.ok(fileExists('src/app/sermons/page.tsx'), 'sermons/page.tsx must exist');
    const content = readFile('src/app/sermons/page.tsx');
    assert.match(content, /sermon/i, 'sermons/page.tsx must display sermons');
  });

  it('T1-F07-02: src/app/sermons/[id]/page.tsx supports document mode and chat mode views', () => {
    assert.ok(fileExists('src/app/sermons/[id]/page.tsx'), 'sermons/[id]/page.tsx must exist');
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.match(content, /chat|documento|document/i, 'sermons/[id]/page.tsx must provide dual document/chat view');
  });

  it('T1-F07-03: Sermon chat bubbles eliminate hardcoded WhatsApp green (#DCF8C6)', () => {
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.doesNotMatch(content, /#DCF8C6|#dcf8c6/, 'sermons/[id]/page.tsx must not use WhatsApp green (#DCF8C6)');
  });

  it('T1-F07-04: Sermon note creation or edit triggers toast feedback', () => {
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.match(content, /toast/, 'sermons/[id]/page.tsx must use toast for mutation feedback');
  });

  it('T1-F07-05: Sermon deletion eliminates window.confirm() in favor of accessible dialog', () => {
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.doesNotMatch(content, /\bconfirm\s*\(/, 'sermons/[id]/page.tsx must not call window.confirm()');
  });
});
