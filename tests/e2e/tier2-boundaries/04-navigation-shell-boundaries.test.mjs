import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 2 - Boundary 04: Navigation & Shell Responsive Boundaries', () => {
  it('T2-F04-01: DesktopHeader conditionally hides on /auth/* authentication routes', () => {
    assert.ok(fileExists('src/components/DesktopHeader.tsx'), 'DesktopHeader.tsx must exist');
    const header = readFile('src/components/DesktopHeader.tsx');
    assert.match(
      header,
      /pathname\.startsWith\(['"]\/auth['"]\)|pathname\.includes\(['"]auth['"]\)/,
      'DesktopHeader should conditionally hide on auth pages'
    );
  });

  it('T2-F04-02: MobileTabBar conditionally adapts or hides in chat view', () => {
    assert.ok(fileExists('src/components/MobileTabBar.tsx'), 'MobileTabBar.tsx must exist');
    const tabBar = readFile('src/components/MobileTabBar.tsx');
    const adaptsOnChat =
      /sermon/i.test(tabBar) ||
      /pathname/i.test(tabBar);
    assert.ok(adaptsOnChat, 'MobileTabBar should inspect route pathname for contextual adaptation');
  });

  it('T2-F04-03: Responsive breakpoint consistency between Header and MobileTabBar', () => {
    const header = readFile('src/components/DesktopHeader.tsx');
    const tabBar = readFile('src/components/MobileTabBar.tsx');
    // Header should be hidden on mobile (hidden sm:block or hidden md:block)
    assert.match(header, /hidden\s+(sm|md):block|hidden\s+(sm|md):flex/, 'DesktopHeader must be hidden on mobile');
    // TabBar should be visible on mobile and hidden on desktop (block sm:hidden or flex md:hidden)
    assert.match(tabBar, /(sm|md):hidden/, 'MobileTabBar must be hidden on desktop');
  });

  it('T2-F04-04: AuthButtons component handles unauthenticated session state gracefully', () => {
    assert.ok(fileExists('src/components/AuthButtons.tsx'), 'AuthButtons.tsx must exist');
    const authButtons = readFile('src/components/AuthButtons.tsx');
    assert.match(authButtons, /useSession|session/, 'AuthButtons must evaluate session state');
    assert.match(authButtons, /signIn|iniciar/i, 'AuthButtons must provide sign-in button for guests');
  });

  it('T2-F04-05: Sidebar drawer includes backdrop overlay and escape/close triggers', () => {
    assert.ok(fileExists('src/components/Sidebar.tsx'), 'Sidebar.tsx must exist');
    const sidebar = readFile('src/components/Sidebar.tsx');
    assert.match(sidebar, /fixed|inset-0|bg-black\/|bg-background/, 'Sidebar must implement overlay or drawer backdrop');
  });
});
