import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Import ConfirmDialog primitive
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const ROOT_DIR = process.cwd();

describe('Domain Feedback Stress & Adversarial Test Suite — Challenger M1 It2', () => {

  // =========================================================================
  // SECTION 1: Global Scan for Lingering Native Dialogs in src/app
  // =========================================================================
  describe('1. Global Native Dialog Scan across src/app', () => {
    function getAllTsFiles(dir: string): string[] {
      const files: string[] = [];
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          files.push(...getAllTsFiles(fullPath));
        } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
          files.push(fullPath);
        }
      }
      return files;
    }

    const appDir = path.join(ROOT_DIR, 'src', 'app');
    const allAppFiles = getAllTsFiles(appDir);

    it('finds at least 20 route/page files in src/app', () => {
      assert.ok(allAppFiles.length >= 20, `Expected >= 20 files in src/app, found ${allAppFiles.length}`);
    });

    it('asserts ZERO native alert() calls across all src/app files', () => {
      const violations: { file: string; line: number; content: string }[] = [];

      for (const filePath of allAppFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          // Match alert( but not toast.alert, etc.
          if (/(?<![\w.$])alert\s*\(/.test(line)) {
            violations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: idx + 1,
              content: line.trim()
            });
          }
        });
      }

      assert.strictEqual(
        violations.length,
        0,
        `Found ${violations.length} lingering alert() calls:\n` +
          violations.map(v => `  ${v.file}:${v.line}: ${v.content}`).join('\n')
      );
    });

    it('asserts ZERO native confirm() calls across all src/app files', () => {
      const violations: { file: string; line: number; content: string }[] = [];

      for (const filePath of allAppFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (/(?<![\w.$])confirm\s*\(/.test(line)) {
            violations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: idx + 1,
              content: line.trim()
            });
          }
        });
      }

      assert.strictEqual(
        violations.length,
        0,
        `Found ${violations.length} lingering confirm() calls:\n` +
          violations.map(v => `  ${v.file}:${v.line}: ${v.content}`).join('\n')
      );
    });

    it('asserts ZERO window.alert or window.confirm references in src/app', () => {
      const violations: { file: string; line: number; content: string }[] = [];

      for (const filePath of allAppFiles) {
        const content = fs.readFileSync(filePath, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, idx) => {
          if (/(window|globalThis)\.(alert|confirm)/.test(line)) {
            violations.push({
              file: path.relative(ROOT_DIR, filePath),
              line: idx + 1,
              content: line.trim()
            });
          }
        });
      }

      assert.strictEqual(
        violations.length,
        0,
        `Found ${violations.length} window.(alert|confirm) references:\n` +
          violations.map(v => `  ${v.file}:${v.line}: ${v.content}`).join('\n')
      );
    });
  });

  // =========================================================================
  // SECTION 2: 6 Domain Routes TypeScript AST Syntax & Integrity Oracle
  // =========================================================================
  describe('2. Domain Routes TypeScript AST & Syntax Oracle', () => {
    const DOMAIN_FILES = [
      'src/app/notes/page.tsx',
      'src/app/devotionals/[date]/page.tsx',
      'src/app/sermons/[id]/page.tsx',
      'src/app/sermons/page-client.tsx',
      'src/app/notifications/page.tsx',
      'src/app/test-push/page.tsx'
    ];

    for (const relPath of DOMAIN_FILES) {
      it(`parses ${relPath} without TypeScript syntax errors`, () => {
        const fullPath = path.join(ROOT_DIR, relPath);
        assert.ok(fs.existsSync(fullPath), `File ${relPath} must exist`);
        const sourceCode = fs.readFileSync(fullPath, 'utf8');

        const sourceFile = ts.createSourceFile(
          relPath,
          sourceCode,
          ts.ScriptTarget.ESNext,
          true,
          ts.ScriptKind.TSX
        );

        // Check for syntactic diagnostics
        const diagnostics: ts.Diagnostic[] = [];
        if ((sourceFile as any).parseDiagnostics) {
          diagnostics.push(...(sourceFile as any).parseDiagnostics);
        }

        assert.strictEqual(
          diagnostics.length,
          0,
          `Syntax error(s) in ${relPath}:\n` +
            diagnostics.map(d => `  Line ${d.start}: ${ts.flattenDiagnosticMessageText(d.messageText, '\n')}`).join('\n')
        );
      });
    }

    it('src/app/notes/page.tsx imports sonner toast and uses warning/success/error', () => {
      const code = fs.readFileSync(path.join(ROOT_DIR, 'src/app/notes/page.tsx'), 'utf8');
      assert.match(code, /import\s+{[^}]*toast[^}]*}\s+from\s+["']sonner["']/);
      assert.match(code, /toast\.warning\(/);
      assert.match(code, /toast\.success\(/);
      assert.match(code, /toast\.error\(/);
      assert.doesNotMatch(code, /(?<!\.)\balert\s*\(/);
    });

    it('src/app/devotionals/[date]/page.tsx imports sonner toast and handles save feedback', () => {
      const code = fs.readFileSync(path.join(ROOT_DIR, 'src/app/devotionals/[date]/page.tsx'), 'utf8');
      assert.match(code, /import\s+{[^}]*toast[^}]*}\s+from\s+["']sonner["']/);
      assert.match(code, /toast\.error\(/);
      assert.match(code, /toast\.success\(/);
      assert.doesNotMatch(code, /(?<!\.)\balert\s*\(/);
    });

    it('src/app/sermons/[id]/page.tsx imports sonner and ConfirmDialog', () => {
      const code = fs.readFileSync(path.join(ROOT_DIR, 'src/app/sermons/[id]/page.tsx'), 'utf8');
      assert.match(code, /import\s+{[^}]*toast[^}]*}\s+from\s+["']sonner["']/);
      assert.match(code, /import\s+{[^}]*ConfirmDialog[^}]*}\s+from\s+["']@\/components\/ui\/confirm-dialog["']/);
      assert.match(code, /toast\.error\(/);
      assert.match(code, /toast\.success\(/);
      assert.match(code, /toast\.warning\(/);
      assert.match(code, /<ConfirmDialog/);
      assert.match(code, /open={!!deleteMessageId}/);
      assert.doesNotMatch(code, /(?<!\.)\balert\s*\(/);
      assert.doesNotMatch(code, /(?<!\.)\bconfirm\s*\(/);
    });

    it('src/app/sermons/page-client.tsx imports sonner and ConfirmDialog', () => {
      const code = fs.readFileSync(path.join(ROOT_DIR, 'src/app/sermons/page-client.tsx'), 'utf8');
      assert.match(code, /import\s+{[^}]*toast[^}]*}\s+from\s+["']sonner["']/);
      assert.match(code, /import\s+{[^}]*ConfirmDialog[^}]*}\s+from\s+["']@\/components\/ui\/confirm-dialog["']/);
      assert.match(code, /toast\.success\(/);
      assert.match(code, /toast\.error\(/);
      assert.match(code, /<ConfirmDialog/);
      assert.match(code, /open={!!sermonToDelete}/);
      assert.doesNotMatch(code, /(?<!\.)\balert\s*\(/);
      assert.doesNotMatch(code, /(?<!\.)\bconfirm\s*\(/);
    });

    it('src/app/notifications/page.tsx imports sonner and ConfirmDialog', () => {
      const code = fs.readFileSync(path.join(ROOT_DIR, 'src/app/notifications/page.tsx'), 'utf8');
      assert.match(code, /import\s+{[^}]*toast[^}]*}\s+from\s+["']sonner["']/);
      assert.match(code, /import\s+{[^}]*ConfirmDialog[^}]*}\s+from\s+["']@\/components\/ui\/confirm-dialog["']/);
      assert.match(code, /toast\.success\(/);
      assert.match(code, /toast\.error\(/);
      assert.match(code, /<ConfirmDialog/);
      assert.match(code, /open={confirmClearOpen}/);
      assert.doesNotMatch(code, /(?<!\.)\balert\s*\(/);
      assert.doesNotMatch(code, /(?<!\.)\bconfirm\s*\(/);
    });

    it('src/app/test-push/page.tsx imports sonner and ConfirmDialog', () => {
      const code = fs.readFileSync(path.join(ROOT_DIR, 'src/app/test-push/page.tsx'), 'utf8');
      assert.match(code, /import\s+{[^}]*toast[^}]*}\s+from\s+["']sonner["']/);
      assert.match(code, /import\s+{[^}]*ConfirmDialog[^}]*}\s+from\s+["']@\/components\/ui\/confirm-dialog["']/);
      assert.match(code, /toast\.success\(/);
      assert.match(code, /toast\.error\(/);
      assert.match(code, /<ConfirmDialog/);
      assert.match(code, /open={confirmResetOpen}/);
      assert.doesNotMatch(code, /(?<!\.)\balert\s*\(/);
      assert.doesNotMatch(code, /(?<!\.)\bconfirm\s*\(/);
    });
  });

  // =========================================================================
  // SECTION 3: ConfirmDialog Component Behavioral & Structural Stress Testing
  // =========================================================================
  describe('3. ConfirmDialog Component Behavioral & Structural Stress Testing', () => {
    it('sets Radix Dialog open property directly to match prop.open', () => {
      const treeClosed = ConfirmDialog({
        open: false,
        onOpenChange: () => {},
        title: 'Eliminar elemento',
        description: 'Esta acción no se puede deshacer.',
        onConfirm: () => {}
      });
      assert.strictEqual(treeClosed.props.open, false);

      const treeOpen = ConfirmDialog({
        open: true,
        onOpenChange: () => {},
        title: 'Eliminar elemento',
        description: 'Esta acción no se puede deshacer.',
        onConfirm: () => {}
      });
      assert.strictEqual(treeOpen.props.open, true);
    });

    it('structures header with Title and Description properly', () => {
      const tree = ConfirmDialog({
        open: true,
        onOpenChange: () => {},
        title: 'Eliminar elemento crítico',
        description: '¿Confirmas la eliminación permanente?',
        confirmLabel: 'Sí, eliminar',
        cancelLabel: 'No, cancelar',
        variant: 'destructive',
        onConfirm: () => {}
      });

      const content = tree.props.children;
      const [header, footer] = content.props.children;
      const [title, desc] = header.props.children;

      assert.strictEqual(title.props.children, 'Eliminar elemento crítico');
      assert.strictEqual(desc.props.children, '¿Confirmas la eliminación permanente?');
    });

    it('renders confirm button with destructive variant and custom labels', () => {
      const tree = ConfirmDialog({
        open: true,
        onOpenChange: () => {},
        title: 'Eliminar',
        description: 'Desc',
        confirmLabel: 'Sí, eliminar',
        cancelLabel: 'No, cancelar',
        variant: 'destructive',
        onConfirm: () => {}
      });

      const [, footer] = tree.props.children.props.children;
      const [cancelBtn, confirmBtn] = footer.props.children;

      assert.strictEqual(cancelBtn.props.children, 'No, cancelar');
      assert.strictEqual(confirmBtn.props.children, 'Sí, eliminar');
      assert.strictEqual(confirmBtn.props.variant, 'destructive');

      const confirmHtml = renderToStaticMarkup(confirmBtn);
      assert.ok(confirmHtml.includes('bg-destructive'), 'Must have destructive class');
      assert.ok(confirmHtml.includes('Sí, eliminar'));

      const cancelHtml = renderToStaticMarkup(cancelBtn);
      assert.ok(cancelHtml.includes('No, cancelar'));
      assert.ok(cancelHtml.includes('border-input'));
    });

    it('renders warm variant on confirm button when variant="warm"', () => {
      const tree = ConfirmDialog({
        open: true,
        onOpenChange: () => {},
        title: 'Guardar cambios',
        description: '¿Deseas guardar los cambios?',
        confirmLabel: 'Guardar',
        variant: 'warm',
        onConfirm: () => {}
      });

      const [, footer] = tree.props.children.props.children;
      const [, confirmBtn] = footer.props.children;

      assert.strictEqual(confirmBtn.props.variant, 'warm');
      const confirmHtml = renderToStaticMarkup(confirmBtn);
      assert.ok(confirmHtml.includes('bg-selapp-brown'), 'Should include warm variant style');
      assert.ok(confirmHtml.includes('Guardar'), 'Should contain confirm label');
    });

    it('renders loading spinner and disabled state on buttons when loading=true', () => {
      const tree = ConfirmDialog({
        open: true,
        onOpenChange: () => {},
        title: 'Eliminando',
        description: 'Por favor espera...',
        loading: true,
        onConfirm: () => {}
      });

      const [, footer] = tree.props.children.props.children;
      const [cancelBtn, confirmBtn] = footer.props.children;

      assert.strictEqual(cancelBtn.props.disabled, true, 'Cancel button must be disabled when loading');
      assert.strictEqual(confirmBtn.props.loading, true, 'Confirm button must have loading=true');

      const confirmHtml = renderToStaticMarkup(confirmBtn);
      assert.ok(confirmHtml.includes('animate-spin'), 'Should contain animate-spin loader');
      assert.ok(confirmHtml.includes('disabled'), 'Confirm button must be disabled while loading');

      const cancelHtml = renderToStaticMarkup(cancelBtn);
      assert.ok(cancelHtml.includes('disabled'), 'Cancel button must be disabled while loading');
    });

    it('invokes onConfirm and onOpenChange(false) on confirm button click', async () => {
      let confirmed = false;
      let openChanged: boolean | null = null;

      const tree = ConfirmDialog({
        open: true,
        onOpenChange: (open) => { openChanged = open; },
        title: 'Título',
        description: 'Desc',
        onConfirm: () => { confirmed = true; }
      });

      const [, footer] = tree.props.children.props.children;
      const [, confirmBtn] = footer.props.children;

      await confirmBtn.props.onClick();

      assert.strictEqual(confirmed, true, 'onConfirm callback must be executed');
      assert.strictEqual(openChanged, false, 'onOpenChange(false) must be called after confirmation');
    });

    it('invokes onOpenChange(false) on cancel button click without calling onConfirm', () => {
      let confirmed = false;
      let openChanged: boolean | null = null;

      const tree = ConfirmDialog({
        open: true,
        onOpenChange: (open) => { openChanged = open; },
        title: 'Título',
        description: 'Desc',
        onConfirm: () => { confirmed = true; }
      });

      const [, footer] = tree.props.children.props.children;
      const [cancelBtn] = footer.props.children;

      cancelBtn.props.onClick();

      assert.strictEqual(confirmed, false, 'onConfirm must not be called on cancel');
      assert.strictEqual(openChanged, false, 'onOpenChange(false) must be called on cancel');
    });

    it('handles dynamic or undefined interpolated descriptions without crashing', () => {
      const dynamicSermon: { title?: string } = {};
      const tree = ConfirmDialog({
        open: true,
        onOpenChange: () => {},
        title: 'Eliminar sermón',
        description: `¿Estás seguro de que quieres eliminar el sermón "${dynamicSermon.title}"?`,
        onConfirm: () => {}
      });

      const [header] = tree.props.children.props.children;
      const [, desc] = header.props.children;

      assert.strictEqual(desc.props.children, '¿Estás seguro de que quieres eliminar el sermón "undefined"?');
    });
  });

  // =========================================================================
  // SECTION 4: Root Layout Toaster Mount & Configuration Verification
  // =========================================================================
  describe('4. Root Layout Toaster Configuration', () => {
    it('layout.tsx mounts <Toaster> inside ThemeProvider with accessible options', () => {
      const layoutCode = fs.readFileSync(path.join(ROOT_DIR, 'src/app/layout.tsx'), 'utf8');
      assert.match(layoutCode, /import\s+{[^}]*Toaster[^}]*}\s+from\s+["']sonner["']/);
      assert.match(layoutCode, /<Toaster/);
      assert.match(layoutCode, /richColors/);
      assert.match(layoutCode, /position="top-right"/);
      assert.match(layoutCode, /closeButton/);
      assert.match(layoutCode, /toastOptions=/);

      // Verify ThemeProvider wrapping
      const themeProviderIdx = layoutCode.indexOf('<ThemeProvider');
      const toasterIdx = layoutCode.indexOf('<Toaster');
      const themeProviderCloseIdx = layoutCode.indexOf('</ThemeProvider>');

      assert.ok(themeProviderIdx !== -1, 'ThemeProvider must exist');
      assert.ok(toasterIdx !== -1, 'Toaster must exist');
      assert.ok(themeProviderCloseIdx !== -1, '</ThemeProvider Must exist');
      assert.ok(
        toasterIdx > themeProviderIdx && toasterIdx < themeProviderCloseIdx,
        '<Toaster> must be nested inside <ThemeProvider>'
      );
    });
  });
});
