import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 2 - Boundary 09: Route Boundaries & Streaming Limits', () => {
  it('T2-F09-01: Versiculos loading boundary src/app/versiculos/loading.tsx exists', () => {
    assert.ok(fileExists('src/app/versiculos/loading.tsx'), 'src/app/versiculos/loading.tsx must exist');
    const content = readFile('src/app/versiculos/loading.tsx');
    assert.match(content, /export\s+default/, 'versiculos/loading.tsx must export default skeleton component');
  });

  it('T2-F09-02: Route error boundaries display localized error message and retry action', () => {
    assert.ok(fileExists('src/app/error.tsx'), 'src/app/error.tsx must exist');
    const errorContent = readFile('src/app/error.tsx');
    assert.match(
      errorContent,
      /intentar|retry|reset\(\)|onClick=\{.*reset.*\}/i,
      'error.tsx must render retry trigger invoking reset()'
    );
  });

  it('T2-F09-03: Route loading skeletons avoid spinning emoji ⏳ completely', () => {
    const loadingFiles = [
      'src/app/loading.tsx',
      'src/app/sermons/loading.tsx',
      'src/app/devotionals/loading.tsx',
      'src/app/notes/loading.tsx'
    ];
    for (const file of loadingFiles) {
      if (fileExists(file)) {
        const content = readFile(file);
        assert.doesNotMatch(content, /⏳/, `${file} must not contain spinning emoji ⏳`);
      }
    }
  });

  it('T2-F09-04: Route loading skeletons specify responsive structure to mitigate CLS', () => {
    const loadingFiles = [
      'src/app/sermons/loading.tsx',
      'src/app/devotionals/loading.tsx'
    ];
    for (const file of loadingFiles) {
      if (fileExists(file)) {
        const content = readFile(file);
        assert.match(
          content,
          /animate-pulse|skeleton|Skeleton|h-|w-/i,
          `${file} must provide dimensional placeholders to prevent layout shift`
        );
      }
    }
  });

  it('T2-F09-05: Error boundaries adapt to semantic theme tokens', () => {
    assert.ok(fileExists('src/app/error.tsx'), 'src/app/error.tsx must exist');
    const content = readFile('src/app/error.tsx');
    assert.match(
      content,
      /bg-background|bg-card|text-foreground|text-muted/i,
      'error.tsx must use semantic tokens'
    );
  });
});
