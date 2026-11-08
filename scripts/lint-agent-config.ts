import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

const MAX_LINES = 150;
const SECRET = /(sk-[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/;
const HEDGES = /si possible|généralement|préférable|essaie|idéalement|when possible|try to|ideally/i;

const errors: string[] = [];
const warnings: string[] = [];

const read = (path: string) => readFileSync(path, 'utf8');
const mdFiles = (dir: string) =>
  existsSync(dir)
    ? readdirSync(dir)
        .filter((f) => f.endsWith('.md'))
        .map((f) => join(dir, f))
    : [];

function frontmatter(path: string) {
  const match = read(path).match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  return Object.fromEntries(
    match[1]
      .split('\n')
      .map((line) => line.match(/^([a-z-]+):\s*(.*)$/))
      .filter((m) => m !== null)
      .map((m) => [m[1], m[2]]),
  );
}

function checkLinks(path: string) {
  for (const [, target] of read(path).matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const file = resolve(dirname(path), target.split('#')[0]);
    if (!existsSync(file)) errors.push(`${path}: broken link ${target}`);
  }
}

if (!existsSync('AGENTS.md')) {
  errors.push('AGENTS.md is missing');
} else {
  const content = read('AGENTS.md');
  const lines = content.split('\n').length;
  if (lines > MAX_LINES) errors.push(`AGENTS.md has ${lines} lines (max ${MAX_LINES})`);
  for (const line of content.split('\n').filter((l) => l.startsWith('@'))) {
    if (!existsSync(line.slice(1).trim())) errors.push(`AGENTS.md: broken import ${line}`);
  }
}
if (existsSync('CLAUDE.md')) errors.push('CLAUDE.md exists next to AGENTS.md: AGENTS.md would be ignored');

const rules = mdFiles('.claude/rules');
for (const path of ['AGENTS.md', ...rules]) {
  if (!existsSync(path)) {
    errors.push(`${path}: broken rule link`);
    continue;
  }
  if (SECRET.test(read(path))) errors.push(`${path}: looks like it contains a secret`);
  read(path)
    .split('\n')
    .forEach((line, i) => {
      if (HEDGES.test(line)) warnings.push(`${path}:${i + 1}: hedge word: ${line.trim()}`);
    });
}

for (const path of ['AGENTS.md', ...mdFiles('docs'), ...mdFiles('docs/adr')]) {
  if (existsSync(path)) checkLinks(path);
}

try {
  JSON.parse(read('.claude/settings.json'));
} catch (error) {
  errors.push(`.claude/settings.json: ${(error as Error).message}`);
}

const skillsDir = '.claude/skills';
for (const dir of existsSync(skillsDir) ? readdirSync(skillsDir) : []) {
  if (!statSync(join(skillsDir, dir)).isDirectory()) continue;
  const path = join(skillsDir, dir, 'SKILL.md');
  const meta = existsSync(path) ? frontmatter(path) : null;
  if (!meta) errors.push(`${path}: missing or without frontmatter`);
  else if (meta.name !== dir) errors.push(`${path}: name "${meta.name}" must match folder "${dir}"`);
  else if (!meta.description) errors.push(`${path}: missing description`);
}

for (const path of mdFiles('.claude/agents')) {
  const meta = frontmatter(path);
  if (!meta?.name || !meta.description) errors.push(`${path}: frontmatter needs name and description`);
  else if (meta.name !== basename(path, '.md')) errors.push(`${path}: name "${meta.name}" must match file name`);
}

for (const warning of warnings) console.warn(`warn  ${warning}`);
for (const error of errors) console.error(`error ${error}`);
console.log(`agent config: ${errors.length} error(s), ${warnings.length} warning(s)`);
process.exit(errors.length > 0 ? 1 : 0);
