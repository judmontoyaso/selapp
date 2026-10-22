import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 2 - Boundary 11: Production Build & Deployment Limits', () => {
  it('T2-F11-01: src/lib/prisma.ts implements global singleton pattern for PrismaClient', () => {
    assert.ok(fileExists('src/lib/prisma.ts'), 'src/lib/prisma.ts must exist');
    const content = readFile('src/lib/prisma.ts');
    assert.match(
      content,
      /globalThis|global\.prisma/,
      'prisma.ts must store PrismaClient in global scope to avoid multiple instances'
    );
  });

  it('T2-F11-02: next.config.mjs headers configure service worker caching rules', () => {
    assert.ok(fileExists('next.config.mjs'), 'next.config.mjs must exist');
    const content = readFile('next.config.mjs');
    assert.match(
      content,
      /service-worker\.js/,
      'next.config.mjs must configure headers for service-worker.js'
    );
    assert.match(
      content,
      /max-age=0|must-revalidate/i,
      'service-worker.js header must specify no-cache or must-revalidate'
    );
  });

  it('T2-F11-03: src/middleware.ts guards protected routes', () => {
    assert.ok(fileExists('src/middleware.ts'), 'src/middleware.ts must exist');
    const content = readFile('src/middleware.ts');
    assert.match(content, /matcher:/, 'middleware.ts must define matcher configuration');
    assert.match(
      content,
      /sermons|devotionals|notes/,
      'middleware.ts matcher must protect core routes'
    );
  });

  it('T2-F11-04: Root layout sets responsive viewport and font variables', () => {
    assert.ok(fileExists('src/app/layout.tsx'), 'src/app/layout.tsx must exist');
    const content = readFile('src/app/layout.tsx');
    assert.match(content, /font-sans/, 'layout.tsx body must set font-sans class');
    assert.match(content, /min-h-screen/, 'layout.tsx body must set min-h-screen class');
  });

  it('T2-F11-05: API route handlers handle unauthenticated requests safely', () => {
    // Check an existing core API route e.g. /api/readings/route.ts or /api/sermons/route.ts
    const readingsApi = fileExists('src/app/api/readings/route.ts')
      ? 'src/app/api/readings/route.ts'
      : fileExists('src/app/api/sermons/route.ts')
      ? 'src/app/api/sermons/route.ts'
      : null;
    assert.ok(readingsApi, 'At least one primary API route must exist');
    const content = readFile(readingsApi);
    assert.match(
      content,
      /status:\s*(401|400|403|200)|getServerSession|authOptions/i,
      'API route handler must validate session or return structured status code'
    );
  });
});
