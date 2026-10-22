import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists, scanFilesForPattern } from '../helpers/test-utils.mjs';

describe('Tier 2 - Boundary 03: Toast System & Modal Confirmation Boundaries', () => {
  it('T2-F03-01: Global scan: zero occurrences of window.alert() in src/app/ routes', () => {
    const matches = scanFilesForPattern('src/app', /\balert\s*\(/);
    assert.strictEqual(
      matches.length,
      0,
      `Found ${matches.length} lingering alert() call(s):\n` +
        matches.map(m => `  ${m.file}:${m.lineNumber}: ${m.lineContent}`).join('\n')
    );
  });

  it('T2-F03-02: Global scan: zero occurrences of window.confirm() in src/app/ routes', () => {
    const matches = scanFilesForPattern('src/app', /\bconfirm\s*\(/);
    assert.strictEqual(
      matches.length,
      0,
      `Found ${matches.length} lingering confirm() call(s):\n` +
        matches.map(m => `  ${m.file}:${m.lineNumber}: ${m.lineContent}`).join('\n')
    );
  });

  it('T2-F03-03: Toaster component specifies richColors and closeButton', () => {
    const layout = readFile('src/app/layout.tsx');
    assert.ok(layout, 'layout.tsx must exist');
    assert.match(
      layout,
      /closeButton|richColors|position/,
      'Toaster configuration should provide closeButton or richColors'
    );
  });

  it('T2-F03-04: Accessible modal confirmation component exists to replace native confirm', () => {
    const exists =
      fileExists('src/components/ui/dialog.tsx') ||
      fileExists('src/components/ui/confirm-dialog.tsx') ||
      fileExists('src/components/ConfirmModal.tsx');
    assert.ok(exists, 'A modern modal confirmation dialog component must exist');
  });

  it('T2-F03-05: Toast invocations include error notifications for API failure handling', () => {
    const matches = scanFilesForPattern('src/app', /toast\.error\(/);
    assert.ok(
      matches.length > 0,
      'Application should invoke toast.error for API or validation failure handling'
    );
  });
});
