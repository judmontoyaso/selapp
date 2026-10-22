#!/usr/bin/env node
/**
 * Master E2E Test Runner for Selapp Modernization
 *
 * Usage:
 *   node scripts/run-e2e-tests.mjs                  # Run all 127 tests
 *   node scripts/run-e2e-tests.mjs --tier=1         # Run only Tier 1
 *   node scripts/run-e2e-tests.mjs --tier=2         # Run only Tier 2
 *   node scripts/run-e2e-tests.mjs --tier=3         # Run only Tier 3
 *   node scripts/run-e2e-tests.mjs --tier=4         # Run only Tier 4
 *   node scripts/run-e2e-tests.mjs --feature=1      # Run Feature 1 tests (Tiers 1 & 2)
 *   node scripts/run-e2e-tests.mjs --mode=baseline  # Run and print scorecard without failing exit code
 *   node scripts/run-e2e-tests.mjs --json           # Output JSON results
 */

import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import process from 'node:process';

const ROOT_DIR = process.cwd();

// Parse CLI arguments
const args = process.argv.slice(2);
const options = {
  tier: null,
  feature: null,
  mode: 'standard', // 'standard' | 'baseline'
  json: false,
  help: false
};

for (const arg of args) {
  if (arg.startsWith('--tier=')) {
    options.tier = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--feature=')) {
    options.feature = parseInt(arg.split('=')[1], 10);
  } else if (arg.startsWith('--mode=')) {
    options.mode = arg.split('=')[1];
  } else if (arg === '--json') {
    options.json = true;
  } else if (arg === '--help' || arg === '-h') {
    options.help = true;
  }
}

if (options.help) {
  console.log(`
Selapp E2E Test Runner
Options:
  --tier=<1|2|3|4>    Filter tests by Tier (1: Features, 2: Boundaries, 3: Combinations, 4: Scenarios)
  --feature=<1..11>   Filter tests by Feature number (1 through 11)
  --mode=baseline     Record baseline scorecard without non-zero exit code
  --mode=standard     Standard CI mode (exits 1 on any test failure)
  --json              Output structured JSON summary
  --help, -h          Show this help message
`);
  process.exit(0);
}

// Discover test files
function getTestFiles() {
  const allFiles = [];

  const tier1Dir = path.join(ROOT_DIR, 'tests', 'e2e', 'tier1-features');
  const tier2Dir = path.join(ROOT_DIR, 'tests', 'e2e', 'tier2-boundaries');
  const tier3Dir = path.join(ROOT_DIR, 'tests', 'e2e', 'tier3-combinations');
  const tier4Dir = path.join(ROOT_DIR, 'tests', 'e2e', 'tier4-scenarios');

  function collect(dir, tierNum) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.test.mjs'));
    for (const f of files) {
      let featureNum = null;
      const match = f.match(/^(\d{2})-/);
      if (match) {
        featureNum = parseInt(match[1], 10);
      }
      allFiles.push({
        fullPath: path.join(dir, f),
        relPath: path.relative(ROOT_DIR, path.join(dir, f)).replace(/\\/g, '/'),
        filename: f,
        tier: tierNum,
        feature: featureNum
      });
    }
  }

  collect(tier1Dir, 1);
  collect(tier2Dir, 2);
  collect(tier3Dir, 3);
  collect(tier4Dir, 4);

  // Apply filters
  let filtered = allFiles;
  if (options.tier !== null) {
    filtered = filtered.filter(f => f.tier === options.tier);
  }
  if (options.feature !== null) {
    filtered = filtered.filter(f => f.feature === options.feature);
  }

  return filtered;
}

const targetFiles = getTestFiles();

if (targetFiles.length === 0) {
  console.error('No test files matched the specified filter criteria.');
  process.exit(1);
}

const startTime = Date.now();

// Execute tests using node --test
const child = spawn(
  process.execPath,
  ['--test', ...targetFiles.map(f => f.relPath)],
  {
    cwd: ROOT_DIR,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false
  }
);

let stdoutBuffer = '';
let stderrBuffer = '';

child.stdout.on('data', chunk => {
  stdoutBuffer += chunk.toString();
});

child.stderr.on('data', chunk => {
  stderrBuffer += chunk.toString();
});

child.on('close', code => {
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  // Parse TAP output
  const lines = stdoutBuffer.split('\n');
  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const testDetails = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('# tests ')) {
      totalTests = parseInt(trimmed.replace('# tests ', ''), 10);
    } else if (trimmed.startsWith('# pass ')) {
      passedTests = parseInt(trimmed.replace('# pass ', ''), 10);
    } else if (trimmed.startsWith('# fail ')) {
      failedTests = parseInt(trimmed.replace('# fail ', ''), 10);
    } else if (trimmed.startsWith('ok ') && !trimmed.includes('- Tier ')) {
      const name = trimmed.replace(/^ok \d+ - /, '');
      testDetails.push({ name, status: 'pass' });
    } else if (trimmed.startsWith('not ok ') && !trimmed.includes('- Tier ')) {
      const name = trimmed.replace(/^not ok \d+ - /, '');
      testDetails.push({ name, status: 'fail' });
    }
  }

  // Calculate tier stats
  const tierStats = {
    1: { name: 'Tier 1: Feature Coverage', pass: 0, fail: 0, total: 0 },
    2: { name: 'Tier 2: Boundary & Corner Cases', pass: 0, fail: 0, total: 0 },
    3: { name: 'Tier 3: Cross-Feature Combinations', pass: 0, fail: 0, total: 0 },
    4: { name: 'Tier 4: Real-World Scenarios', pass: 0, fail: 0, total: 0 }
  };

  for (const t of testDetails) {
    let tNum = null;
    if (t.name.startsWith('T1-')) tNum = 1;
    else if (t.name.startsWith('T2-')) tNum = 2;
    else if (t.name.startsWith('T3-')) tNum = 3;
    else if (t.name.startsWith('T4-')) tNum = 4;

    if (tNum) {
      tierStats[tNum].total++;
      if (t.status === 'pass') tierStats[tNum].pass++;
      else tierStats[tNum].fail++;
    }
  }

  // Feature stats for Tiers 1 & 2
  const featureNames = [
    'Semantic Tokens & Dark Mode',
    'Atomic UI Library (src/components/ui/)',
    'Sonner Toast System & Modals',
    'Modern Navigation & Shell',
    'Home Dashboard Modernization',
    'Devocionales Diarios Enhancement',
    'Sermones Experience Refinement',
    'Editor de Notas / Diario Espiritual',
    'Route Boundaries & Skeletons',
    'ESLint & Type Quality Hardening',
    'Production Build Contracts'
  ];

  const featureStats = {};
  for (let f = 1; f <= 11; f++) {
    const prefix1 = `T1-F${String(f).padStart(2, '0')}`;
    const prefix2 = `T2-F${String(f).padStart(2, '0')}`;
    const fTests = testDetails.filter(t => t.name.startsWith(prefix1) || t.name.startsWith(prefix2));
    const pass = fTests.filter(t => t.status === 'pass').length;
    featureStats[f] = {
      name: featureNames[f - 1] || `Feature ${f}`,
      total: fTests.length,
      pass,
      fail: fTests.length - pass
    };
  }

  if (options.json) {
    const report = {
      timestamp: new Date().toISOString(),
      durationSeconds: parseFloat(duration),
      mode: options.mode,
      summary: {
        total: totalTests,
        pass: passedTests,
        fail: failedTests,
        passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) + '%' : '0%'
      },
      tiers: tierStats,
      features: featureStats,
      tests: testDetails
    };
    console.log(JSON.stringify(report, null, 2));
    if (options.mode === 'baseline') process.exit(0);
    process.exit(code);
  }

  // Formatted Console Scorecard
  console.log('\n================================================================');
  console.log('              SELAPP E2E TEST SUITE SCORECARD                  ');
  console.log('================================================================');
  console.log(`Execution Mode : ${options.mode.toUpperCase()}`);
  console.log(`Total Duration : ${duration}s`);
  console.log(`Total Tests    : ${totalTests} (Target: 127)`);
  console.log(`Passed         : ${passedTests}`);
  console.log(`Failed         : ${failedTests}`);
  const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
  console.log(`Pass Rate      : ${passRate}%`);
  console.log('----------------------------------------------------------------');
  console.log('TIER BREAKDOWN:');
  for (let tier = 1; tier <= 4; tier++) {
    const ts = tierStats[tier];
    if (ts.total > 0) {
      const rate = ((ts.pass / ts.total) * 100).toFixed(0);
      const icon = ts.fail === 0 ? '✓' : '✗';
      console.log(`  ${icon} ${ts.name.padEnd(36)} : ${ts.pass}/${ts.total} passed (${rate}%)`);
    }
  }
  console.log('----------------------------------------------------------------');
  console.log('FEATURE BREAKDOWN (Tiers 1 & 2):');
  for (let f = 1; f <= 11; f++) {
    const fs = featureStats[f];
    if (fs.total > 0) {
      const rate = ((fs.pass / fs.total) * 100).toFixed(0);
      const icon = fs.fail === 0 ? '✓' : '✗';
      const label = `F${String(f).padStart(2, '0')}: ${fs.name}`.padEnd(42);
      console.log(`  ${icon} ${label} : ${fs.pass}/${fs.total} passed (${rate}%)`);
    }
  }
  console.log('================================================================');

  if (options.mode === 'baseline') {
    console.log('Baseline recording completed successfully. (Exit code 0 enforced)');
    process.exit(0);
  } else {
    if (failedTests > 0) {
      console.log(`\nRun with --mode=baseline to view without failing exit code.`);
      process.exit(code);
    } else {
      console.log('\nAll E2E test assertions passed successfully!');
      process.exit(0);
    }
  }
});
