import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, readJson, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 10: ESLint & Type Quality Hardening', () => {
  it('T1-F10-01: tsconfig.json enforces strict TypeScript configuration', () => {
    assert.ok(fileExists('tsconfig.json'), 'tsconfig.json must exist');
    const tsconfig = readJson('tsconfig.json');
    assert.strictEqual(
      tsconfig.compilerOptions?.strict,
      true,
      'tsconfig.json must have compilerOptions.strict = true'
    );
  });

  it('T1-F10-02: Logo.tsx uses Next.js Image or SVG rather than raw <img>', () => {
    assert.ok(fileExists('src/components/Logo.tsx'), 'Logo.tsx must exist');
    const logoContent = readFile('src/components/Logo.tsx');
    assert.doesNotMatch(logoContent, /<img\b/, 'Logo.tsx must not use raw <img> tag');
  });

  it('T1-F10-03: sermons/[id]/page.tsx uses Next.js Image rather than raw <img>', () => {
    assert.ok(fileExists('src/app/sermons/[id]/page.tsx'), 'sermons/[id]/page.tsx must exist');
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.doesNotMatch(content, /<img\b/, 'sermons/[id]/page.tsx must not use raw <img> tag');
  });

  it('T1-F10-04: devotionals/[date]/page.tsx useEffect includes complete dependencies', () => {
    assert.ok(fileExists('src/app/devotionals/[date]/page.tsx'), 'devotionals/[date]/page.tsx must exist');
    const content = readFile('src/app/devotionals/[date]/page.tsx');
    // Ensure fetchDevotional is inside useEffect or properly referenced in dependency array or wrapped in useCallback
    const hasFetchInDepsOrCallback =
      /\[.*fetchDevotional.*\]/.test(content) ||
      /useCallback\(.*fetchDevotional/.test(content) ||
      !content.includes('fetchDevotional');
    assert.ok(hasFetchInDepsOrCallback, 'fetchDevotional should be included in deps or wrapped in useCallback');
  });

  it('T1-F10-05: notifications/page.tsx useEffect includes complete dependencies', () => {
    assert.ok(fileExists('src/app/notifications/page.tsx'), 'notifications/page.tsx must exist');
    const content = readFile('src/app/notifications/page.tsx');
    const hasFetchInDepsOrCallback =
      /\[.*fetchNotifications.*\]/.test(content) ||
      /useCallback\(.*fetchNotifications/.test(content) ||
      !content.includes('fetchNotifications');
    assert.ok(hasFetchInDepsOrCallback, 'fetchNotifications should be included in deps or wrapped in useCallback');
  });
});
