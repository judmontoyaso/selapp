import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

// Import M1 modules
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge, badgeVariants } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

const ROOT_DIR = process.cwd();

describe('M1 Empirical Stress Test Suite — Challenger M1', () => {

  // =========================================================================
  // SECTION 1: cn utility stress testing and adversarial edge cases
  // =========================================================================
  describe('1. cn Utility Stress Testing', () => {
    it('merges simple conflicting Tailwind utility classes correctly', () => {
      assert.strictEqual(cn('p-4', 'p-8'), 'p-8');
      assert.strictEqual(cn('px-2', 'px-6'), 'px-6');
      assert.strictEqual(cn('py-1', 'py-4'), 'py-4');
      assert.strictEqual(cn('m-2', 'm-6'), 'm-6');
      assert.strictEqual(cn('mt-2', 'mt-8'), 'mt-8');
      assert.strictEqual(cn('text-sm', 'text-lg'), 'text-lg');
    });

    it('merges conflicting color classes properly', () => {
      assert.strictEqual(cn('bg-red-500', 'bg-blue-500'), 'bg-blue-500');
      assert.strictEqual(cn('text-red-500', 'text-blue-500'), 'text-blue-500');
      assert.strictEqual(cn('border-gray-200', 'border-red-500'), 'border-red-500');
    });

    it('merges conflicting layout and border properties', () => {
      assert.strictEqual(cn('block', 'inline-block', 'flex'), 'flex');
      assert.strictEqual(cn('flex-row', 'flex-col'), 'flex-col');
      assert.strictEqual(cn('rounded-sm', 'rounded-xl'), 'rounded-xl');
      assert.strictEqual(cn('shadow-sm', 'shadow-xl'), 'shadow-xl');
      assert.strictEqual(cn('opacity-50', 'opacity-100'), 'opacity-100');
    });

    it('handles responsive and pseudo-class variant conflicts', () => {
      assert.strictEqual(cn('hover:p-2', 'hover:p-6'), 'hover:p-6');
      assert.strictEqual(cn('md:p-4', 'md:p-8'), 'md:p-8');
      assert.strictEqual(cn('dark:bg-black', 'dark:bg-white'), 'dark:bg-white');
      // Preserves non-conflicting modifiers
      assert.strictEqual(cn('p-2', 'hover:p-4'), 'p-2 hover:p-4');
      assert.strictEqual(cn('bg-red-500', 'dark:bg-blue-500'), 'bg-red-500 dark:bg-blue-500');
    });

    it('handles falsy values, null, undefined, booleans, and 0 cleanly', () => {
      assert.strictEqual(cn('base', null, undefined, false, 'active'), 'base active');
      assert.strictEqual(cn(null, undefined, false), '');
      assert.strictEqual(cn(''), '');
      assert.strictEqual(cn('test', 0 && 'never'), 'test');
    });

    it('handles objects, nested arrays, and complex conditionals', () => {
      const result = cn(
        'base-class',
        ['nested-1', ['deep-nested-2']],
        { 'active-true': true, 'active-false': false },
        { 'p-2': true },
        'p-6'
      );
      assert.strictEqual(result, 'base-class nested-1 deep-nested-2 active-true p-6');
    });

    it('preserves custom arbitrary Tailwind values and CSS variables', () => {
      assert.strictEqual(cn('bg-[var(--primary)]', 'bg-[var(--secondary)]'), 'bg-[var(--secondary)]');
      assert.strictEqual(cn('w-[100px]', 'w-[200px]'), 'w-[200px]');
    });
  });

  // =========================================================================
  // SECTION 2: HSL Semantic CSS Variables Validation & Mathematical Oracle
  // =========================================================================
  describe('2. HSL Variables Semantic & Mathematical Parsing', () => {
    const cssPath = path.join(ROOT_DIR, 'src', 'app', 'globals.css');
    const cssContent = fs.readFileSync(cssPath, 'utf8');

    function extractBlock(content: string, selector: string) {
      const idx = content.indexOf(selector);
      if (idx === -1) return '';
      const start = content.indexOf('{', idx);
      if (start === -1) return '';
      let depth = 1;
      let pos = start + 1;
      while (pos < content.length && depth > 0) {
        if (content[pos] === '{') depth++;
        else if (content[pos] === '}') depth--;
        pos++;
      }
      return content.slice(start + 1, pos - 1);
    }

    function parseVariables(block: string) {
      const vars: Record<string, string> = {};
      const lines = block.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('--')) {
          const colonIdx = trimmed.indexOf(':');
          if (colonIdx !== -1) {
            const key = trimmed.slice(0, colonIdx).trim();
            const val = trimmed.slice(colonIdx + 1).replace(';', '').trim();
            vars[key] = val;
          }
        }
      }
      return vars;
    }

    const rootVars = parseVariables(extractBlock(cssContent, ':root'));
    const darkVars = parseVariables(extractBlock(cssContent, '.dark'));

    const COLOR_TOKENS = [
      '--background',
      '--foreground',
      '--card',
      '--card-foreground',
      '--popover',
      '--popover-foreground',
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--muted',
      '--muted-foreground',
      '--accent',
      '--accent-foreground',
      '--destructive',
      '--destructive-foreground',
      '--border',
      '--input',
      '--ring'
    ];

    it(':root contains all 19 color tokens and 1 radius token', () => {
      for (const token of COLOR_TOKENS) {
        assert.ok(rootVars[token], `:root must define ${token}`);
      }
      assert.ok(rootVars['--radius'], ':root must define --radius');
      assert.match(rootVars['--radius'], /^\d+(\.\d+)?(rem|px|em)$/, '--radius must be valid CSS length');
    });

    it('.dark contains all 19 color tokens', () => {
      for (const token of COLOR_TOKENS) {
        assert.ok(darkVars[token], `.dark must define ${token}`);
      }
    });

    // Mathematical validator oracle for Tailwind HSL color string syntax: "H S% L%"
    function validateHSLValue(tokenName: string, value: string, context: string) {
      const match = value.match(/^([\d.]+)\s+([\d.]+)%\s+([\d.]+)%$/);
      assert.ok(match, `${context} ${tokenName} value "${value}" does not match H S% L% pattern`);
      
      const hue = parseFloat(match[1]);
      const sat = parseFloat(match[2]);
      const light = parseFloat(match[3]);

      assert.ok(hue >= 0 && hue <= 360, `${context} ${tokenName} hue ${hue} is outside [0, 360]`);
      assert.ok(sat >= 0 && sat <= 100, `${context} ${tokenName} saturation ${sat} is outside [0, 100]`);
      assert.ok(light >= 0 && light <= 100, `${context} ${tokenName} lightness ${light} is outside [0, 100]`);

      const validCssHsl = `hsl(${hue} ${sat}% ${light}% / 0.5)`;
      assert.ok(validCssHsl.length > 0);
    }

    it('all :root color variables parse as mathematically valid HSL components', () => {
      for (const token of COLOR_TOKENS) {
        validateHSLValue(token, rootVars[token], ':root');
      }
    });

    it('all .dark color variables parse as mathematically valid HSL components', () => {
      for (const token of COLOR_TOKENS) {
        validateHSLValue(token, darkVars[token], '.dark');
      }
    });

    it('dark mode background is measurably darker than light mode background', () => {
      const rootBgLightness = parseFloat(rootVars['--background'].split(/\s+/)[2].replace('%', ''));
      const darkBgLightness = parseFloat(darkVars['--background'].split(/\s+/)[2].replace('%', ''));
      assert.ok(
        darkBgLightness < rootBgLightness,
        `Dark mode background lightness (${darkBgLightness}%) must be less than light mode (${rootBgLightness}%)`
      );
      assert.ok(darkBgLightness < 20, `Dark mode background lightness should be dark (< 20%), got ${darkBgLightness}%`);
      assert.ok(rootBgLightness > 80, `Light mode background lightness should be bright (> 80%), got ${rootBgLightness}%`);
    });
  });

  // =========================================================================
  // SECTION 3: Button Primitive & CVA Variants Stress Testing
  // =========================================================================
  describe('3. Button Primitive & CVA Variant Generation', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'warm'] as const;
    const sizes = ['default', 'sm', 'lg', 'icon'] as const;

    it('generates distinct classes for all 7 variants', () => {
      const generated = new Set();
      for (const v of variants) {
        const cls = buttonVariants({ variant: v });
        assert.ok(cls.length > 0, `Variant ${v} should produce classes`);
        assert.ok(!generated.has(cls), `Variant ${v} generated duplicate classes`);
        generated.add(cls);
      }
    });

    it('generates distinct classes for all 4 sizes', () => {
      const generated = new Set();
      for (const s of sizes) {
        const cls = buttonVariants({ size: s });
        assert.ok(cls.length > 0, `Size ${s} should produce classes`);
        assert.ok(!generated.has(cls), `Size ${s} generated duplicate classes`);
        generated.add(cls);
      }
    });

    it('Button component allows custom className to override variant defaults via cn', () => {
      const html = renderToStaticMarkup(
        React.createElement(Button, { variant: 'default', className: 'bg-amber-500 p-12' }, 'Override')
      );
      assert.ok(!html.includes('bg-primary '), 'bg-primary should be overridden by bg-amber-500');
      assert.ok(html.includes('bg-amber-500'), 'Should contain bg-amber-500');
      assert.ok(html.includes('p-12'), 'Should contain p-12');
    });

    it('renders static HTML button element with default attributes', () => {
      const html = renderToStaticMarkup(React.createElement(Button, null, 'Click Me'));
      assert.ok(html.startsWith('<button'), 'Should render <button>');
      assert.ok(html.includes('Click Me'), 'Should render child text');
      assert.ok(html.includes('bg-primary'), 'Should render primary variant class');
      assert.ok(html.includes('inline-flex items-center justify-center'), 'Should render base classes');
    });

    it('renders disabled attribute and styles when disabled=true', () => {
      const html = renderToStaticMarkup(React.createElement(Button, { disabled: true }, 'Disabled'));
      assert.ok(html.includes('disabled=""') || html.includes('disabled'), 'Must contain disabled attribute');
      assert.ok(html.includes('disabled:pointer-events-none'), 'Must include disabled pointer-events rule');
      assert.ok(html.includes('disabled:opacity-50'), 'Must include disabled opacity rule');
    });

    it('renders loading spinner and disabled state when loading=true', () => {
      const html = renderToStaticMarkup(React.createElement(Button, { loading: true }, 'Saving'));
      assert.ok(html.includes('disabled=""') || html.includes('disabled'), 'Must be disabled when loading');
      assert.ok(html.includes('animate-spin'), 'Must contain animate-spin spinner');
      assert.ok(html.includes('Saving'), 'Must preserve button text');
    });

    it('Button asChild renders correctly with Slottable delegation', () => {
      const link = React.createElement('a', { href: '/test-route' }, 'Go to Page');
      const html = renderToStaticMarkup(
        React.createElement(Button, { asChild: true, variant: 'warm' }, link)
      );
      assert.ok(html.startsWith('<a href="/test-route"'), 'Should render <a> tag');
      assert.ok(html.includes('Go to Page'), 'Should render child content');
      assert.ok(html.includes('bg-selapp-brown'), 'Should merge warm variant class onto <a>');
    });
  });

  // =========================================================================
  // SECTION 4: Card, Input, Badge, Skeleton Static Rendering
  // =========================================================================
  describe('4. Additional Atomic Primitives Static Rendering', () => {
    it('Card compound components render correct semantic structure', () => {
      const cardTree = React.createElement(
        Card,
        { className: 'max-w-md' },
        React.createElement(
          CardHeader,
          null,
          React.createElement(CardTitle, null, 'Devocional Diario'),
          React.createElement(CardDescription, null, 'Lectura matutina')
        ),
        React.createElement(CardContent, null, React.createElement('p', null, 'Texto bíblico')),
        React.createElement(CardFooter, null, React.createElement('button', null, 'Acción'))
      );
      const html = renderToStaticMarkup(cardTree);

      assert.ok(html.includes('rounded-2xl border'), 'Card border classes');
      assert.ok(html.includes('bg-card text-card-foreground shadow-sm'), 'Card base classes');
      assert.ok(html.includes('font-serif'), 'CardTitle must include font-serif');
      assert.ok(html.includes('Devocional Diario'), 'CardTitle text');
      assert.ok(html.includes('text-muted-foreground'), 'CardDescription text styling');
      assert.ok(html.includes('max-w-md'), 'Custom className merged via cn');
    });

    it('Input renders with accessible focus rings and custom type/placeholder', () => {
      const html = renderToStaticMarkup(
        React.createElement(Input, {
          type: 'email',
          placeholder: 'correo@ejemplo.com',
          className: 'custom-input-class'
        })
      );

      assert.ok(html.includes('type="email"'), 'Must pass type');
      assert.ok(html.includes('placeholder="correo@ejemplo.com"'), 'Must pass placeholder');
      assert.ok(html.includes('focus-visible:ring-2'), 'Must include focus ring');
      assert.ok(html.includes('custom-input-class'), 'Must merge custom class');
    });

    it('Badge variants render and support custom className', () => {
      const badgeVariantsList = ['default', 'secondary', 'destructive', 'outline', 'accent', 'warm', 'success'] as const;
      for (const v of badgeVariantsList) {
        const cls = badgeVariants({ variant: v });
        assert.ok(cls.length > 0, `Badge variant ${v} should produce classes`);
      }

      const html = renderToStaticMarkup(
        React.createElement(Badge, { variant: 'warm', className: 'text-xs uppercase' }, 'Nuevo')
      );
      assert.ok(html.includes('bg-selapp-beige-dark text-selapp-brown-dark'), 'Warm badge styles');
      assert.ok(html.includes('text-xs uppercase'), 'Custom badge classes merged');
    });

    it('Skeleton renders with animate-pulse and muted background', () => {
      const html = renderToStaticMarkup(
        React.createElement(Skeleton, { className: 'h-12 w-full rounded-lg' })
      );
      assert.ok(html.includes('animate-pulse'), 'Skeleton must have animate-pulse');
      assert.ok(html.includes('bg-muted/70'), 'Skeleton must use muted background');
      assert.ok(html.includes('h-12 w-full rounded-lg'), 'Skeleton must merge custom dimensions');
    });
  });
});
