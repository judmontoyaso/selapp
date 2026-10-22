import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 09: Route Boundaries & Skeleton Streaming', () => {
  it('T1-F09-01: Root loading boundary src/app/loading.tsx exists', () => {
    assert.ok(fileExists('src/app/loading.tsx'), 'src/app/loading.tsx must exist');
    const content = readFile('src/app/loading.tsx');
    assert.match(content, /export\s+default/, 'src/app/loading.tsx must export default component');
  });

  it('T1-F09-02: Sermons route loading boundary src/app/sermons/loading.tsx exists', () => {
    assert.ok(fileExists('src/app/sermons/loading.tsx'), 'src/app/sermons/loading.tsx must exist');
    const content = readFile('src/app/sermons/loading.tsx');
    assert.match(content, /export\s+default/, 'src/app/sermons/loading.tsx must export default component');
  });

  it('T1-F09-03: Devotionals route loading boundary src/app/devotionals/loading.tsx exists', () => {
    assert.ok(fileExists('src/app/devotionals/loading.tsx'), 'src/app/devotionals/loading.tsx must exist');
    const content = readFile('src/app/devotionals/loading.tsx');
    assert.match(content, /export\s+default/, 'src/app/devotionals/loading.tsx must export default component');
  });

  it('T1-F09-04: Notes route loading boundary src/app/notes/loading.tsx exists', () => {
    assert.ok(fileExists('src/app/notes/loading.tsx'), 'src/app/notes/loading.tsx must exist');
    const content = readFile('src/app/notes/loading.tsx');
    assert.match(content, /export\s+default/, 'src/app/notes/loading.tsx must export default component');
  });

  it('T1-F09-05: Root error boundary src/app/error.tsx is a client component with reset() prop', () => {
    assert.ok(fileExists('src/app/error.tsx'), 'src/app/error.tsx must exist');
    const content = readFile('src/app/error.tsx');
    assert.match(content, /['"]use client['"]/, 'error.tsx must declare "use client"');
    assert.match(content, /reset/, 'error.tsx must accept reset function prop');
  });
});
