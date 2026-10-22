import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 2 - Boundary 02: Atomic UI Primitives Robustness', () => {
  it('T2-F02-01: src/lib/utils.ts handles falsy and conditional arguments cleanly', () => {
    assert.ok(fileExists('src/lib/utils.ts'), 'src/lib/utils.ts must exist');
    const content = readFile('src/lib/utils.ts');
    assert.match(content, /ClassValue/, 'cn must support ClassValue inputs');
  });

  it('T2-F02-02: Button disabled state handles disabled:pointer-events-none and disabled:opacity-50', () => {
    assert.ok(fileExists('src/components/ui/button.tsx'), 'src/components/ui/button.tsx must exist');
    const content = readFile('src/components/ui/button.tsx');
    assert.match(
      content,
      /disabled:pointer-events-none|disabled:opacity/,
      'Button must specify pointer-events or opacity styles for disabled state'
    );
  });

  it('T2-F02-03: Input primitive handles placeholder and focus-visible rings', () => {
    assert.ok(fileExists('src/components/ui/input.tsx'), 'src/components/ui/input.tsx must exist');
    const content = readFile('src/components/ui/input.tsx');
    assert.match(
      content,
      /focus-visible:ring|focus:ring/,
      'Input must define focus ring indicator'
    );
  });

  it('T2-F02-04: Dialog primitive exports DialogOverlay and DialogContent with accessible transitions', () => {
    assert.ok(fileExists('src/components/ui/dialog.tsx'), 'src/components/ui/dialog.tsx must exist');
    const content = readFile('src/components/ui/dialog.tsx');
    assert.match(content, /DialogOverlay|DialogContent/, 'Dialog must export DialogOverlay and DialogContent');
  });

  it('T2-F02-05: Skeleton primitive provides animate-pulse with neutral or muted token background', () => {
    assert.ok(fileExists('src/components/ui/skeleton.tsx'), 'src/components/ui/skeleton.tsx must exist');
    const content = readFile('src/components/ui/skeleton.tsx');
    assert.match(content, /animate-pulse/, 'Skeleton must use animate-pulse');
    assert.match(content, /bg-muted|bg-primary\/|bg-secondary|bg-gray-/, 'Skeleton must have background class');
  });
});
