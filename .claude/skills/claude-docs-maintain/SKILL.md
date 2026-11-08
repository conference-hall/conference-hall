---
name: claude-docs-maintain
description: Periodic upkeep of an already restructured Claude Code configuration. Detects drift between AGENTS.md/docs and the code, prunes useless instructions, promotes violated rules to hooks, proposes skills and subagents for repeated procedures. Use after a stack change, every month, or when Claude keeps making the same mistakes.
---

# Claude Code configuration maintenance

Read `docs/agents/checklist-2026.md`. This skill assumes an already structured root
instructions file (`AGENTS.md` or `CLAUDE.md`); otherwise run `claude-config-audit`.

Produce `docs/agents/maintenance-<YYYY-MM-DD>.md` **and** apply the safe fixes directly (see
"Autonomy").

## 0. Root file name

If the root file is still named `CLAUDE.md` and `claude --version` ≥ 2.1.277, propose
renaming it to `AGENTS.md` (criterion A1b). If `CLAUDE.md` and `AGENTS.md` coexist, report it
first: `AGENTS.md` is ignored.

## 1. Command and stack drift

- Compare every command cited in the root file, its imports, `.claude/rules/**`, the skills
  and `docs/**` with the manifests and CI. Report the ones that disappeared or whose flags
  changed.
- Compare pinned versions with the manifests.
- Check every `@` import and internal link.

## 2. Architecture drift

- `git log --since="<date of the last report or 60 days ago>" --name-only --format=''` →
  folders added/removed. The folder map of the root file and `docs/architecture.md` must
  reflect them.
- Recent structural decisions without an ADR: propose a short ADR for each; write only what
  is visible in the code.

## 3. Per-session load

Recompute root file + imports + rules without `paths:`. If the total is > 200 lines, propose
what moves to an on-demand link, to a rule with `paths:`, or to a skill.

## 4. Pruning and promotion

For each instruction of the root file and the rules:

- **Useless?** Claude would follow it without the line → candidate for removal.
- **Violated?** Proof in recent history (commits, PRs) → if imperative, promote it to a hook
  or CI check and reduce it to one line.
- **Vague?** Rephrase as a verifiable instruction with an example.
- **Misplaced?** Only concerns a subfolder → `.claude/rules/` with `paths:` or the subfolder's
  instructions file.
- **Badly written (B6)?** No leading imperative verb, hedge word, two rules in one sentence,
  prohibition without a reason → rewrite with the procedure of `claude-config-restructure`
  step 1b, checking that the rewritten version keeps every command, path, number, example and
  reason. A vague line that cannot become verifiable is not shortened: replace it with an
  example from the repo or propose its removal.
- **Added with `#` during a session?** Recent short instructions are often one-off reactions:
  check that they deserve to stay.

Log every removed instruction in `docs/agents/CHANGELOG.md` with its reason.

## 5. Repeated procedures → skills and subagents

- In recent history, patterns with ≥ 2 occurrences (same files changed together, same
  messages: "add migration", "bump deps", "release") without an existing skill → propose a
  skill (`name`, `description` "Does X. Use when Y.", steps). Create it only if the procedure
  can be fully rebuilt from the code/CI.
- Repeated review or exploration tasks without a subagent → propose `.claude/agents/<name>.md`
  (restricted tools, suitable model).

## 6. Health of skills, agents, hooks

- Each `SKILL.md` and `.claude/agents/*.md`: valid frontmatter, `name` = folder/file,
  description says when to use it, body < 500 lines, existing commands/paths, no stray README.
- `.claude/settings.json`: parsable; every hook script exists and is executable; every hook is
  tested with a sample JSON on stdin.
- `.claude/commands/` must no longer exist (migrated to skills).

## 7. Lint

- Root file ≤ 150 lines (`wc -l AGENTS.md`). Run the repo's config lint (`pnpm agents:check`
  here); if none exists, propose creating it (see `claude-config-restructure`, step 7).

## Autonomy

Apply **without asking**: fixing commands/versions/imports/links, a one-line B6 rewrite when
the rewritten version still holds all its information (otherwise it is a proposal), updating
the folder map, repairing a broken hook without changing its behavior.

**Ask first**: removing an instruction, creating or changing a hook or a permission, creating
a skill, a subagent or an ADR, moving a rule. Group these requests into a single checkbox
question at the end of the report.

## Report

```markdown
# Claude Code config maintenance: <date>

> Read this file when: you want to know what changed in the config and why.

## Applied automatically

## Proposed (awaiting approval)

### Instructions to remove

### Rules to promote to hooks

### Skills / subagents to create

### ADRs to write

### Rules to move

## Indicators

| | Before | After |
| Root file lines | | |
| Lines loaded per session | | |
| Imperative instructions | | |
| Broken imports/links | | 0 |
| Hedge words (B6 grep) | | 0 |
| Lines without an imperative verb (excluding commands/headings) | | |
| Valid skills + agents / total | | |
```

Conclude in 3 lines: fixed, pending, suggested next review date.
