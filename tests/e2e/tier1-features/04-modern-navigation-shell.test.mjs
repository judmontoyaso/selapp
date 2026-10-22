import { describe, it } from 'node:test';
import assert from 'node:assert';
import { readFile, fileExists } from '../helpers/test-utils.mjs';

describe('Tier 1 - Feature 04: Modern Navigation & Application Shell', () => {
  it('T1-F04-01: DesktopHeader.tsx includes ThemeToggle component', () => {
    assert.ok(fileExists('src/components/DesktopHeader.tsx'), 'DesktopHeader.tsx must exist');
    const header = readFile('src/components/DesktopHeader.tsx');
    assert.match(header, /ThemeToggle/, 'DesktopHeader must integrate ThemeToggle');
  });

  it('T1-F04-02: MobileTabBar.tsx provides navigation tabs for primary routes', () => {
    assert.ok(fileExists('src/components/MobileTabBar.tsx'), 'MobileTabBar.tsx must exist');
    const tabBar = readFile('src/components/MobileTabBar.tsx');
    assert.match(tabBar, /\/sermons/, 'MobileTabBar must link to /sermons');
    assert.match(tabBar, /\/devotionals/, 'MobileTabBar must link to /devotionals');
    assert.match(tabBar, /\/notes/, 'MobileTabBar must link to /notes');
  });

  it('T1-F04-03: Sidebar.tsx provides collapsible navigation with modern design', () => {
    assert.ok(fileExists('src/components/Sidebar.tsx'), 'Sidebar.tsx must exist');
    const sidebar = readFile('src/components/Sidebar.tsx');
    assert.match(sidebar, /Link/, 'Sidebar must use Next.js Link');
    assert.match(sidebar, /transition/, 'Sidebar must implement smooth transitions');
  });

  it('T1-F04-04: src/app/layout.tsx provides mobile-safe padding to prevent navbar clipping', () => {
    assert.ok(fileExists('src/app/layout.tsx'), 'layout.tsx must exist');
    const layout = readFile('src/app/layout.tsx');
    assert.match(layout, /pb-20|pb-24|pb-16/, 'layout.tsx must specify mobile bottom padding for MobileTabBar');
  });

  it('T1-F04-05: Navigation links use Next.js Link with active state awareness', () => {
    const tabBar = readFile('src/components/MobileTabBar.tsx');
    assert.match(tabBar, /usePathname/, 'MobileTabBar must utilize usePathname for active route styling');
  });
});
