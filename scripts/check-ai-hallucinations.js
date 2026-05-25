#!/usr/bin/env node
// Guardrail: AI Hallucination Detection
// Purpose: Prevent AI-generated dead code in the project
// Usage: node scripts/check-ai-hallucinations.js

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const PROJECT_ROOT = import.meta.dirname.replace('/scripts', '');
const STARWIND_DIR = join(PROJECT_ROOT, 'src/components/starwind');
const COMPONENTS_DIR = join(PROJECT_ROOT, 'src/components');
const STYLES_DIR = join(PROJECT_ROOT, 'src/styles');

let WARNINGS = [];
let ERRORS = [];
let INFO = [];

// ═══ Check 1: Dead Tailwind Config ═══
const configs = ['tailwind.config.js', 'tailwind.config.ts', 'tailwind.js', 'tailwind.ts'];
for (const config of configs) {
  if (existsSync(join(PROJECT_ROOT, config))) {
    ERRORS.push(`Dead Tailwind config: ${config} (v3 anti-pattern in v4 project)`);
  }
}

// ═══ Check 2: Starwind Structure ═══
if (existsSync(STARWIND_DIR)) {
  let barrelCount = 0;
  let compCount = 0;
  for (const entry of readdirSync(STARWIND_DIR)) {
    const path = join(STARWIND_DIR, entry);
    if (!statSync(path).isDirectory()) continue;
    compCount++;
    if (existsSync(join(path, 'index.ts')) || existsSync(join(path, 'index.js'))) {
      barrelCount++;
    }
  }
  if (barrelCount === compCount) {
    INFO.push(`Starwind: ${compCount} components with barrel files (standard)`);
  } else {
    WARNINGS.push(`Starwind inconsistency: ${barrelCount}/${compCount} have barrel files`);
  }
}

// ═══ Check 3: Orphaned CSS ═══
if (existsSync(STYLES_DIR)) {
  const orphans = [];
  for (const file of readdirSync(STYLES_DIR)) {
    if (!file.endsWith('.css')) continue;
    const content = readFileSync(join(STYLES_DIR, file), 'utf8');
    for (const match of content.matchAll(/\.([\w-]+)\s*\{/g)) {
      const cls = match[1];
      if (cls.startsWith('tw-') || cls.startsWith('@')) continue;
      // Quick orphan check
      let used = false;
      for (const dir of [COMPONENTS_DIR, join(PROJECT_ROOT, 'src/pages')]) {
        if (!existsSync(dir)) continue;
        for (const e of readdirSync(dir)) {
          const p = join(dir, e);
          if (statSync(p).isDirectory()) continue;
          if (readFileSync(p, 'utf8').includes(cls)) { used = true; break; }
        }
        if (used) break;
      }
      if (!used) orphans.push(cls);
    }
  }
  if (orphans.length > 0) {
    WARNINGS.push(`Orphaned CSS: ${orphans.length} unused class(es)`);
  }
}

// ═══ Output Results ═══
console.log('=== AI Hallucination Guardrail ===');
console.log(`Project: ${PROJECT_ROOT}`);
console.log('');

if (WARNINGS.length > 0) {
  console.log(`Warnings: ${WARNINGS.length}`);
  WARNINGS.forEach(w => console.log(`  ⚠️ ${w}`));
}
if (ERRORS.length > 0) {
  console.log(`Errors: ${ERRORS.length}`);
  ERRORS.forEach(e => console.log(`  ❌ ${e}`));
}
if (INFO.length > 0) {
  console.log(`Info: ${INFO.length}`);
  INFO.forEach(i => console.log(`  ℹ️ ${i}`));
}
if (WARNINGS.length === 0 && ERRORS.length === 0 && INFO.length === 0) {
  console.log('✅ All checks passed — no hallucinations detected');
}

const totalIssues = ERRORS.length + WARNINGS.length;
console.log(`\nTotal issues: ${totalIssues} (${ERRORS.length} errors, ${WARNINGS.length} warnings)`);
if (totalIssues > 0) process.exit(1);
