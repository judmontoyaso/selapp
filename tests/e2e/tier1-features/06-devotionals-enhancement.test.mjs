import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 06: Devocionales Diarios Enhancement', () => {
  it('T1-F06-01: src/app/devotionals/page.tsx renders devotional catalog with modern layout', () => {
    assert.ok(fileExists('src/app/devotionals/page.tsx'), 'devotionals/page.tsx must exist');
    const content = readFile('src/app/devotionals/page.tsx');
    assert.match(content, /devotional|devocional/i, 'devotionals/page.tsx must display devotionals');
  });

  it('T1-F06-02: src/app/devotionals/[date]/page.tsx supports reading mode with serif scriptures', () => {
    assert.ok(fileExists('src/app/devotionals/[date]/page.tsx'), 'devotionals/[date]/page.tsx must exist');
    const content = readFile('src/app/devotionals/[date]/page.tsx');
    assert.match(content, /font-serif/, 'devotionals/[date]/page.tsx must use serif styling for scripture passages');
  });

  it('T1-F06-03: src/app/devotionals/[date]/page.tsx provides interactive reflection Q&A section', () => {
    const content = readFile('src/app/devotionals/[date]/page.tsx');
    assert.match(
      content,
      /reflexion|pregunta|answer|question/i,
      'devotionals/[date]/page.tsx must include reflection questions and interactive answers'
    );
  });

  it('T1-F06-04: Devotionals loading states eliminate spinning emoji ⏳ in favor of skeletons', () => {
    const listContent = readFile('src/app/devotionals/page.tsx');
    const detailContent = readFile('src/app/devotionals/[date]/page.tsx');
    assert.doesNotMatch(listContent, /⏳/, 'devotionals list must not contain spinning emoji ⏳');
    assert.doesNotMatch(detailContent, /⏳/, 'devotionals detail must not contain spinning emoji ⏳');
  });

  it('T1-F06-05: Saving reflection provides toast notification feedback', () => {
    const content = readFile('src/app/devotionals/[date]/page.tsx');
    assert.match(content, /toast\.(success|error|info)|toast\(/, 'devotionals/[date]/page.tsx must invoke toast on reflection actions');
  });
});
