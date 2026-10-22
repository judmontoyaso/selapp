import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, readJson, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 11: Production Build & Deployment Contracts', () => {
  it('T1-F11-01: prisma/schema.prisma defines core database models', () => {
    assert.ok(fileExists('prisma/schema.prisma'), 'prisma/schema.prisma must exist');
    const schema = readFile('prisma/schema.prisma');
    assert.match(schema, /model\s+sermons\b|model\s+Sermon\b/, 'schema.prisma must define sermon model');
    assert.match(schema, /model\s+users\b|model\s+User\b/, 'schema.prisma must define user model');
  });

  it('T1-F11-02: package.json build script executes prisma generate and next build', () => {
    const pkg = readJson('package.json');
    assert.ok(pkg.scripts?.build, 'package.json must contain build script');
    assert.match(pkg.scripts.build, /prisma generate/, 'build script must invoke prisma generate');
    assert.match(pkg.scripts.build, /next build/, 'build script must invoke next build');
  });

  it('T1-F11-03: next.config.mjs enforces reactStrictMode', () => {
    assert.ok(fileExists('next.config.mjs'), 'next.config.mjs must exist');
    const config = readFile('next.config.mjs');
    assert.match(config, /reactStrictMode:\s*true/, 'next.config.mjs must set reactStrictMode to true');
  });

  it('T1-F11-04: Primary route page files export valid default components', () => {
    const routes = [
      'src/app/page.tsx',
      'src/app/sermons/page.tsx',
      'src/app/devotionals/page.tsx',
      'src/app/notes/page.tsx'
    ];
    for (const route of routes) {
      assert.ok(fileExists(route), `${route} must exist`);
      const content = readFile(route);
      assert.match(content, /export\s+default/, `${route} must export default component`);
    }
  });

  it('T1-F11-05: Root layout provides suppressHydrationWarning on root <html>', () => {
    assert.ok(fileExists('src/app/layout.tsx'), 'layout.tsx must exist');
    const layout = readFile('src/app/layout.tsx');
    assert.match(layout, /<html[^>]*suppressHydrationWarning/, 'layout.tsx must include suppressHydrationWarning on <html>');
  });
});
