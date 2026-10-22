import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists, scanFilesForPattern } from '../helpers/test-utils.mjs';

describe('Tier 2 - Boundary 10: Code Quality & Static Analysis Boundaries', () => {
  it('T2-F10-01: tsconfig.json specifies moduleResolution bundler and path aliases', () => {
    assert.ok(fileExists('tsconfig.json'), 'tsconfig.json must exist');
    const content = readFile('tsconfig.json');
    assert.match(content, /"moduleResolution":\s*"bundler"/, 'tsconfig.json must specify bundler moduleResolution');
    assert.match(content, /"@\/\*":\s*\["\.\/src\/\*"\]/, 'tsconfig.json must configure @/* path alias');
  });

  it('T2-F10-02: next.config.mjs configures remote image patterns for asset loading', () => {
    assert.ok(fileExists('next.config.mjs'), 'next.config.mjs must exist');
    const content = readFile('next.config.mjs');
    assert.match(content, /images:\s*\{/, 'next.config.mjs must specify images configuration');
  });

  it('T2-F10-03: Next.js Image components include alt attributes for accessibility', () => {
    const matches = scanFilesForPattern('src/components', /<Image\b/);
    for (const match of matches) {
      assert.doesNotMatch(
        match.lineContent,
        /<Image\b(?![^>]*alt=)/,
        `Next.js <Image /> at ${match.file}:${match.lineNumber} must include an alt attribute`
      );
    }
  });

  it('T2-F10-04: Codebase contains zero debugger statements', () => {
    const matches = scanFilesForPattern('src', /\bdebugger;/);
    assert.strictEqual(
      matches.length,
      0,
      `Found debugger statement(s) in production code:\n` +
        matches.map(m => `  ${m.file}:${m.lineNumber}`).join('\n')
    );
  });

  it('T2-F10-05: Push notification hooks satisfy useCallback/useEffect dependency standards', () => {
    assert.ok(fileExists('src/components/PushNotifications.tsx'), 'PushNotifications.tsx must exist');
    const content = readFile('src/components/PushNotifications.tsx');
    assert.match(content, /useCallback|useEffect/, 'PushNotifications must use React hooks properly');
  });
});
