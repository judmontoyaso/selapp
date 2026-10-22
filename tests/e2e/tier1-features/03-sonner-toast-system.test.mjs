import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists, readJson } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 03: Sonner Toast System & Modal Feedback', () => {
  it('T1-F03-01: sonner is listed in package.json dependencies', () => {
    const pkg = readJson('package.json');
    assert.ok(
      (pkg.dependencies && pkg.dependencies.sonner) || (pkg.devDependencies && pkg.devDependencies.sonner),
      'package.json must include "sonner" as a dependency'
    );
  });

  it('T1-F03-02: Toaster component from sonner is mounted in src/app/layout.tsx', () => {
    assert.ok(fileExists('src/app/layout.tsx'), 'src/app/layout.tsx must exist');
    const layout = readFile('src/app/layout.tsx');
    assert.match(layout, /Toaster/, 'src/app/layout.tsx must reference Toaster');
    assert.match(layout, /sonner/, 'src/app/layout.tsx or its mounted toast wrapper must import sonner');
  });

  it('T1-F03-03: alert() is replaced with toast in src/app/devotionals/[date]/page.tsx', () => {
    assert.ok(fileExists('src/app/devotionals/[date]/page.tsx'), 'devotionals/[date]/page.tsx must exist');
    const content = readFile('src/app/devotionals/[date]/page.tsx');
    assert.doesNotMatch(content, /\balert\s*\(/, 'devotionals/[date]/page.tsx must not use native alert()');
    assert.match(content, /toast/, 'devotionals/[date]/page.tsx should use toast for feedback');
  });

  it('T1-F03-04: alert() and confirm() are replaced in src/app/sermons/[id]/page.tsx', () => {
    assert.ok(fileExists('src/app/sermons/[id]/page.tsx'), 'sermons/[id]/page.tsx must exist');
    const content = readFile('src/app/sermons/[id]/page.tsx');
    assert.doesNotMatch(content, /\balert\s*\(/, 'sermons/[id]/page.tsx must not use native alert()');
    assert.doesNotMatch(content, /\bconfirm\s*\(/, 'sermons/[id]/page.tsx must not use native confirm()');
  });

  it('T1-F03-05: alert() is replaced with toast in src/app/notes/page.tsx', () => {
    assert.ok(fileExists('src/app/notes/page.tsx'), 'notes/page.tsx must exist');
    const content = readFile('src/app/notes/page.tsx');
    assert.doesNotMatch(content, /\balert\s*\(/, 'notes/page.tsx must not use native alert()');
    assert.match(content, /toast/, 'notes/page.tsx should use toast for feedback');
  });
});
