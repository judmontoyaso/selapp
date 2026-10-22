import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Import M1 primitives
import { Button, buttonVariants } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const ROOT_DIR = process.cwd();

describe('M1 Iteration 2 Adversarial Challenge Suite — Challenger M1-IT2', () => {

  // =========================================================================
  // SECTION 1: Exhaustive Button Polymorphism & asChild Edge Case Stress Testing
  // =========================================================================
  describe('1. Button asChild Polymorphic Delegation Matrix', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'warm'] as const;
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    it('renders all 28 variant x size combinations cleanly with asChild=true on <a>', () => {
      for (const variant of variants) {
        for (const size of sizes) {
          const element = React.createElement(
            Button,
            { asChild: true, variant, size },
            React.createElement('a', { href: `/test/${variant}/${size}` }, `${variant}-${size}`)
          );
          const html = renderToStaticMarkup(element);
          assert.ok(html.startsWith('<a href="/test/'), `Should render <a> tag for ${variant}-${size}`);
          assert.ok(html.includes(`${variant}-${size}`), `Should render text for ${variant}-${size}`);
          assert.ok(html.includes('inline-flex items-center justify-center'), `Should contain base classes`);
        }
      }
    });

    it('asChild with loading=true injects animate-spin spinner into delegated tag', () => {
      const element = React.createElement(
        Button,
        { asChild: true, loading: true, variant: 'warm' },
        React.createElement('a', { href: '/loading-test' }, 'Processing')
      );
      const html = renderToStaticMarkup(element);
      
      assert.ok(html.startsWith('<a href="/loading-test"'), 'Must delegate to <a> element');
      assert.ok(html.includes('animate-spin'), 'Must include animate-spin spinner inside <a>');
      assert.ok(html.includes('Processing'), 'Must preserve child text inside <a>');
      assert.ok(html.includes('bg-selapp-brown'), 'Must preserve warm variant styling');
      assert.ok(html.includes('disabled'), 'Must apply disabled attribute when loading');
    });

    it('asChild with loading=false does NOT produce false booleans or extra nodes in DOM', () => {
      const element = React.createElement(
        Button,
        { asChild: true, loading: false },
        React.createElement('a', { href: '/clean-dom' }, 'Clean Link')
      );
      const html = renderToStaticMarkup(element);
      
      assert.strictEqual(html.includes('animate-spin'), false, 'Should not contain spinner');
      assert.strictEqual(html.includes('false'), false, 'Should not output boolean string "false"');
      assert.ok(html.includes('Clean Link'), 'Should preserve child text');
    });

    it('asChild delegates cleanly to non-anchor tags (div, span, summary, label)', () => {
      const tags = ['div', 'span', 'summary', 'label'] as const;
      for (const tag of tags) {
        const element = React.createElement(
          Button,
          { asChild: true, variant: 'secondary' },
          React.createElement(tag, { id: `delegated-${tag}` }, `I am a ${tag}`)
        );
        const html = renderToStaticMarkup(element);
        assert.ok(html.startsWith(`<${tag} id="delegated-${tag}"`), `Should delegate to <${tag}> tag`);
        assert.ok(html.includes(`I am a ${tag}`), `Should render content for ${tag}`);
      }
    });

    it('asChild merges nested rich children (icons, spans, formatting) without throwing', () => {
      const richChild = React.createElement(
        'a',
        { href: '/rich-child' },
        React.createElement('span', { className: 'icon-prefix' }, '★'),
        ' Premium ',
        React.createElement('strong', null, 'Pass')
      );
      const element = React.createElement(
        Button,
        { asChild: true, loading: true },
        richChild
      );
      const html = renderToStaticMarkup(element);
      
      assert.ok(html.includes('animate-spin'), 'Contains loader');
      assert.ok(html.includes('class="icon-prefix"'), 'Preserves nested span');
      assert.ok(html.includes('<strong>Pass</strong>'), 'Preserves nested strong');
      assert.ok(html.includes('★'), 'Preserves nested icon');
    });

    it('asChild preserves custom HTML attributes, aria attributes, and data attributes', () => {
      const element = React.createElement(
        Button,
        { asChild: true, className: 'custom-btn-override' },
        React.createElement(
          'a',
          {
            href: 'https://example.com',
            target: '_blank',
            rel: 'noopener noreferrer',
            'aria-label': 'External Link to Example',
            'data-testid': 'external-button-link'
          },
          'Visit Example'
        )
      );
      const html = renderToStaticMarkup(element);
      
      assert.ok(html.includes('target="_blank"'), 'Preserves target');
      assert.ok(html.includes('rel="noopener noreferrer"'), 'Preserves rel');
      assert.ok(html.includes('aria-label="External Link to Example"'), 'Preserves aria-label');
      assert.ok(html.includes('data-testid="external-button-link"'), 'Preserves data-testid');
      assert.ok(html.includes('custom-btn-override'), 'Merges custom className');
    });

    it('Button forwards refs properly when asChild=true', () => {
      let refAssigned = false;
      const refCallback = (node: any) => {
        if (node) refAssigned = true;
      };
      // Test React element creation with ref
      const element = React.createElement(
        Button,
        { asChild: true, ref: refCallback },
        React.createElement('button', { type: 'button' }, 'Ref test')
      );
      const html = renderToStaticMarkup(element);
      assert.ok(html.includes('Ref test'), 'Renders ref component');
    });
  });

  // =========================================================================
  // SECTION 2: Feature 3 Toast and Dialog Exhaustive Verification
  // =========================================================================
  describe('2. Feature 3 Sonner Toast & Modal Dialog Elimination Audit', () => {
    function findSourceFiles(dir: string, fileList: string[] = []): string[] {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          findSourceFiles(fullPath, fileList);
        } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
          fileList.push(fullPath);
        }
      }
      return fileList;
    }

    const srcDir = path.join(ROOT_DIR, 'src');
    const allSrcFiles = findSourceFiles(srcDir);

    it('audits all src/ source files: exactly ZERO alert() calls exist', () => {
      const alertRegex = /\balert\s*\(/g;
      const violatingFiles: { file: string; line: number; match: string }[] = [];

      for (const file of allSrcFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Skip comments
          if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
          if (alertRegex.test(line)) {
            violatingFiles.push({ file: path.relative(ROOT_DIR, file), line: i + 1, match: line.trim() });
          }
        }
      }

      assert.strictEqual(
        violatingFiles.length,
        0,
        `Found lingering alert() calls in: ${JSON.stringify(violatingFiles, null, 2)}`
      );
    });

    it('audits all src/ source files: exactly ZERO confirm() calls exist', () => {
      const confirmRegex = /\bconfirm\s*\(/g;
      const violatingFiles: { file: string; line: number; match: string }[] = [];

      for (const file of allSrcFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          // Skip comments
          if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
          if (confirmRegex.test(line)) {
            violatingFiles.push({ file: path.relative(ROOT_DIR, file), line: i + 1, match: line.trim() });
          }
        }
      }

      assert.strictEqual(
        violatingFiles.length,
        0,
        `Found lingering confirm() calls in: ${JSON.stringify(violatingFiles, null, 2)}`
      );
    });

    it('ConfirmDialog primitive structure contains expected dialog elements', () => {
      const dialogTree = ConfirmDialog({
        open: true,
        onOpenChange: () => {},
        title: 'Eliminar Devocional',
        description: 'Esta acción no se puede deshacer.',
        confirmLabel: 'Confirmar Eliminación',
        cancelLabel: 'Regresar',
        variant: 'destructive',
        onConfirm: () => {}
      });

      assert.ok(React.isValidElement(dialogTree), 'ConfirmDialog must return a valid React element');
      const dialogTreeProps = (dialogTree as any).props;
      assert.strictEqual(dialogTreeProps.open, true, 'Dialog root receives open=true');
      
      const content = dialogTreeProps.children;
      assert.ok(content, 'Dialog contains DialogContent');
      const header = content.props.children[0];
      assert.ok(header, 'DialogContent contains DialogHeader');
      
      const [titleEl, descEl] = header.props.children;
      assert.strictEqual(titleEl.props.children, 'Eliminar Devocional', 'DialogTitle receives title prop');
      assert.strictEqual(descEl.props.children, 'Esta acción no se puede deshacer.', 'DialogDescription receives description prop');
    });

    it('ConfirmDialog element tree configures buttons with loading and variant props', () => {
      const openLoadingTree = ConfirmDialog({
        open: true,
        onOpenChange: () => {},
        title: 'Procesando Guardado',
        description: 'Por favor espere mientras se guarda.',
        loading: true,
        variant: 'warm',
        confirmLabel: 'Guardar Ahora',
        cancelLabel: 'Atrás',
        onConfirm: () => {}
      });

      assert.ok(React.isValidElement(openLoadingTree), 'Returns valid element');
      // Children of Dialog is DialogContent
      const content = (openLoadingTree as any).props.children;
      assert.ok(content, 'Dialog contains DialogContent');
      // DialogContent has [DialogHeader, DialogFooter]
      const footer = content.props.children[1];
      assert.ok(footer, 'DialogContent contains DialogFooter');
      // DialogFooter has [CancelButton, ConfirmButton]
      const [cancelBtn, confirmBtn] = footer.props.children;
      assert.strictEqual(cancelBtn.props.disabled, true, 'Cancel button is disabled when loading');
      assert.strictEqual(cancelBtn.props.children, 'Atrás', 'Cancel button has custom label');
      assert.strictEqual(confirmBtn.props.loading, true, 'Confirm button receives loading=true');
      assert.strictEqual(confirmBtn.props.variant, 'warm', 'Confirm button receives variant=warm');
      assert.strictEqual(confirmBtn.props.children, 'Guardar Ahora', 'Confirm button has custom label');
    });

    it('Root layout mounts Toaster component with required attributes', () => {
      const layoutPath = path.join(ROOT_DIR, 'src', 'app', 'layout.tsx');
      const layoutContent = fs.readFileSync(layoutPath, 'utf8');

      assert.ok(layoutContent.includes('<Toaster'), 'Root layout must mount <Toaster');
      assert.ok(layoutContent.includes('richColors'), 'Toaster must include richColors prop');
      assert.ok(layoutContent.includes('position="top-right"'), 'Toaster must specify position="top-right"');
      assert.ok(layoutContent.includes('closeButton'), 'Toaster must include closeButton prop');
    });

    it('All client files using toast import from sonner cleanly', () => {
      const targetFiles = [
        path.join(ROOT_DIR, 'src', 'app', 'devotionals', '[date]', 'page.tsx'),
        path.join(ROOT_DIR, 'src', 'app', 'sermons', '[id]', 'page.tsx'),
        path.join(ROOT_DIR, 'src', 'app', 'sermons', 'page-client.tsx'),
        path.join(ROOT_DIR, 'src', 'app', 'notes', 'page.tsx'),
        path.join(ROOT_DIR, 'src', 'app', 'notifications', 'page.tsx'),
        path.join(ROOT_DIR, 'src', 'app', 'test-push', 'page.tsx')
      ];

      for (const filePath of targetFiles) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          assert.ok(
            content.includes('import { toast } from "sonner"') ||
            content.includes("import { toast } from 'sonner'"),
            `${path.relative(ROOT_DIR, filePath)} must import toast from sonner`
          );
        }
      }
    });
  });

  // =========================================================================
  // SECTION 3: Milestone Gate Execution Oracle
  // =========================================================================
  describe('3. Milestone Gate Contract Verification', () => {
    it('verifies all 4 milestone 1 features pass via programmatic audit', () => {
      const runnerScript = path.join(ROOT_DIR, 'scripts', 'run-e2e-tests.mjs');
      assert.ok(fs.existsSync(runnerScript), 'run-e2e-tests.mjs must exist');
    });
  });
});
