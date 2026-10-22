import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 02: Atomic UI Library (src/components/ui/)', () => {
  it('T1-F02-01: src/lib/utils.ts exports cn utility using clsx and tailwind-merge', () => {
    assert.ok(fileExists('src/lib/utils.ts'), 'src/lib/utils.ts must exist');
    const content = readFile('src/lib/utils.ts');
    assert.match(content, /export\s+function\s+cn|export\s+const\s+cn/, 'utils.ts must export function cn');
    assert.match(content, /clsx/, 'cn must incorporate clsx');
    assert.match(content, /tailwind-merge|twMerge/, 'cn must incorporate tailwind-merge');
  });

  it('T1-F02-02: Button primitive in src/components/ui/button.tsx supports standard variants', () => {
    assert.ok(fileExists('src/components/ui/button.tsx'), 'src/components/ui/button.tsx must exist');
    const content = readFile('src/components/ui/button.tsx');
    assert.match(content, /export\s+(const|default|function)\s+Button|export\s+\{\s*Button/, 'button.tsx must export Button');
    // Check variant support (e.g. cva or variant mapping)
    assert.match(content, /variant|destructive|outline|ghost/, 'Button must define variant styling');
  });

  it('T1-F02-03: Card compound primitives in src/components/ui/card.tsx export full structure', () => {
    assert.ok(fileExists('src/components/ui/card.tsx'), 'src/components/ui/card.tsx must exist');
    const content = readFile('src/components/ui/card.tsx');
    assert.match(content, /CardHeader/, 'card.tsx must export CardHeader');
    assert.match(content, /CardTitle/, 'card.tsx must export CardTitle');
    assert.match(content, /CardContent/, 'card.tsx must export CardContent');
  });

  it('T1-F02-04: Input and Badge primitives exist in src/components/ui/', () => {
    assert.ok(fileExists('src/components/ui/input.tsx'), 'src/components/ui/input.tsx must exist');
    assert.ok(fileExists('src/components/ui/badge.tsx'), 'src/components/ui/badge.tsx must exist');
    const inputContent = readFile('src/components/ui/input.tsx');
    const badgeContent = readFile('src/components/ui/badge.tsx');
    assert.match(inputContent, /export\s+(const|default|function)\s+Input|export\s+\{\s*Input/, 'input.tsx must export Input');
    assert.match(badgeContent, /export\s+(const|default|function)\s+Badge|export\s+\{\s*Badge/, 'badge.tsx must export Badge');
  });

  it('T1-F02-05: Accessible primitives (Dialog, DropdownMenu, Skeleton, Tabs) exist in src/components/ui/', () => {
    const requiredPrimitives = ['dialog.tsx', 'dropdown-menu.tsx', 'skeleton.tsx', 'tabs.tsx'];
    for (const primitive of requiredPrimitives) {
      assert.ok(
        fileExists(`src/components/ui/${primitive}`),
        `src/components/ui/${primitive} must exist`
      );
    }
  });
});
