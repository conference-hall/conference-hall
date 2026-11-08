---
name: claude-config-audit
description: Audits a repo's Claude Code configuration (AGENTS.md/CLAUDE.md, .claude/rules, skills, agents, commands, settings/hooks, docs/) against the 2026 checklist and produces a migration plan without changing anything. Use before any overhaul of the root instructions file, or when Claude seems to ignore the project instructions.
---

# Claude Code configuration audit

You are **read-only**: you change no project file and produce a single deliverable,
`docs/agents/MIGRATION-PLAN.md`.

Read `docs/agents/checklist-2026.md` in full first. Every finding in the report cites the
criterion id (e.g. `B1`, `F1`).

## 1. Inventory

Locate and read, when they exist:

- Root: `AGENTS.md`, `CLAUDE.md`, `CLAUDE.local.md`, `.claudeignore`, and any instructions file
  for another tool (`.cursorrules`, `GEMINI.md`, `.github/copilot-instructions.md`)
- `.claude/`: `settings.json`, `settings.local.json`, `rules/`, `skills/`, `agents/`,
  `commands/`
- Nested instruction files: `find . \( -name CLAUDE.md -o -name AGENTS.md \) -not -path '*/node_modules/*'`
- Files imported with `@` from the root file (follow each import, depth 2)
- Docs: `README.md`, `CONTRIBUTING.md`, `docs/**`, ADRs
- Project context: manifests (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`),
  CI, `Makefile`/`justfile`, lint/format/test scripts

For each instructions file, record: lines, number of imperative instructions (lines starting
with a verb, "always/never", bullets), `@` imports, and duplicates with another file
(paragraph by paragraph comparison).

## 2. Root file name

- Run `claude --version` (or ask for it if unavailable). If ≥ 2.1.277 and the root file is
  named `CLAUDE.md`: record recommendation A1b (rename to `AGENTS.md`) and list the conditions
  to check (no `CLAUDE.md` in a parent folder, `@` imports resolved after the rename, no
  Bedrock/Vertex/Foundry).
- If `CLAUDE.md` and `AGENTS.md` coexist: Claude Code ignores `AGENTS.md`; report it as
  blocking.

## 3. What loads on every session

Compute the real load: root file + `@` imports + `.claude/rules/*.md` without `paths:` +
`~/.claude/CLAUDE.md` if readable. Give the total in lines and approximate tokens
(lines × 12). Conclude in one sentence: "on every session Claude loads X lines, Y of which are
rarely useful".

## 4. Criterion by criterion evaluation

Walk through sections A → I of the checklist. For each MUST and SHOULD: ✅ / ⚠️ / ❌ / n/a
with a one-line proof (path:line or command run).

Test for real, do not assume:

- Do the cited commands exist? (`grep` the manifests; run nothing destructive.)
- Do `@` imports and internal links point to existing files?
- Do skill and agent `description` fields say _when_ to use them?
- Which "must always" rules have no matching hook or CI check?
- Is `settings.json` valid (parsable JSON, consistent hook matchers)?
- Style (B6): count instruction lines that do not start with an imperative verb (excluding
  commands, paths, headings, tables), hedge words (`grep -ciE "si possible|généralement|préférable|essaie|idéalement|when possible|try to|ideally|generally"`),
  and prohibitions without a reason. Give the three numbers and two example lines to rewrite,
  each with its rewritten version that **keeps** command, reason and example.

## 5. Extraction candidates

From the content and `git log --oneline -200` (recurring messages, files often changed
together):

- Repeated procedures and `.claude/commands/*.md` → **skill** candidates (name + description
  "Does X. Use when Y.").
- Repeated roles (review, tests, migrations) → **subagent** candidates (name, tools, model).
- Rules scoped to a code area → **rule** candidates with a `paths:` glob.
- Imperative rules → **hook** candidates (event + matcher + command).
- Long content → **docs/** candidates (target file + "Read this file when: ..." line), each
  with: `@` import (always loaded) or link (on demand).

## 6. Deliverable: `docs/agents/MIGRATION-PLAN.md`

Required structure:

```markdown
# Migration plan: Claude Code configuration

Generated on <date> by claude-config-audit. Read this file when: you run `claude-config-restructure`.

## Summary (5 lines max)

Current state, per-session load, 3 main problems, estimated effort (S/M/L).

## Score per section

| Section | MUST ok/total | SHOULD ok/total | Blocking points |

## Findings

<one block per ❌/⚠️ criterion, with proof and a concrete fix>

## Target tree

<full tree of the root file, .claude/ and docs/ after migration>

## Ordered steps

Each step: title, files touched, commands, verification criterion, commit message.

## Proposed root file content

<full draft ≤ 150 lines, sections C1→C9, based on the existing file>

## Decisions for the human

<open questions: rename to AGENTS.md (yes/no, with the Claude Code version found),
keep/delete a file, import vs link, which model for an agent...>
```

## 7. End

Finish with 3 lines: plan path, number of unmet MUSTs, an invitation to review "Decisions for
the human" before running `claude-config-restructure`.

Forbidden: generic recommendations. Every line of the plan names a file of this repo.
