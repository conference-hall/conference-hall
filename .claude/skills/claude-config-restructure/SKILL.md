---
name: claude-config-restructure
description: Executes docs/agents/MIGRATION-PLAN.md to restructure a repo's Claude Code configuration (short verifiable AGENTS.md, path-scoped rules, skills, hooks and permissions in settings.json, subagents, agent-oriented docs/). Use after claude-config-audit, or directly to bootstrap the config of a repo that has none.
---

# Claude Code configuration restructuring

Prerequisite: `docs/agents/MIGRATION-PLAN.md` exists. Otherwise run `claude-config-audit`, then
stop so the human can review the plan.

Read `docs/agents/checklist-2026.md`. Everything you write follows the MUSTs; report every
unmet SHOULD and why.

## Execution rules

1. **One plan step = one commit.** Message: the one from the plan.
2. **Never lose content.** Every existing instruction is kept, moved (docs/, rules/, skill,
   hook) or removed _with a justification_ in `docs/agents/CHANGELOG.md` ("removed: "X":
   Claude already does it without the instruction / duplicate of Y / replaced by hook Z").
3. **Do not settle the "Decisions for the human".** If a step depends on one without an answer
   in the plan, ask and wait.
4. **Verify each step** with its criterion before the next one.
5. Branch `chore/claude-config` if the repo is clean; otherwise ask.

## Reference order (adapt to the plan)

### Step 1: Root instructions file

- If the plan approved the rename (A1b): `git mv CLAUDE.md AGENTS.md`. Check that no
  `CLAUDE.md` remains in the repo or in a parent folder, then start a session and confirm the
  instructions load and the `@` imports resolve; if they do not, convert them to Markdown
  links. Subfolder `CLAUDE.md` files take the same name.
- Rewrite the file from the plan's draft. ≤ 150 lines, sections C1→C9.
- Check every cited command in the manifests.
- `@` imports: 3 to 5 maximum, only for what every session needs. Everything else as a
  Markdown link.
- Delete instructions files of other tools that became orphans (`.cursorrules`, `GEMINI.md`...)
  if the plan says so.
- `CLAUDE.local.md` and `.claude/settings.local.json` in `.gitignore`.

### Step 1b: Rewriting pass (B6)

Apply it to every instructions file written or moved in this step and the next ones (root,
subfolders, rules, skill bodies), never to commands or code examples.

Procedure, line by line:

1. If the line is a command, a path, a heading, a table or a reason attached to the previous
   line: leave it as is.
2. Otherwise, rewrite it: leading imperative verb, a single instruction, active voice, no hedge
   word or politeness, reason kept as a short clause.
3. Before accepting the rewrite, check that the new line still contains **every** command,
   path, number, name and example of the old one, and its reason. If something is missing,
   start again. If the line held two rules, produce two lines.
4. A line that expresses no verifiable rule after the rewrite ("the code must be clean") is not
   shortened: either replace it with a do/don't example from the repo, or remove it with a
   justification in the CHANGELOG.

Pass check: before/after `diff`; for every removed or changed line, a one-line comment in the
CHANGELOG under "Rewrites" (""X" → "Y", kept: command, reason"). Remaining hedge words must be
zero (`grep -ciE "si possible|généralement|préférable|essaie|idéalement|when possible|try to|ideally"`).

### Step 2: Progressive disclosure

- `.claude/rules/<topic>.md` for each rule candidate of the plan, frontmatter:
  ```yaml
  ---
  paths:
    - 'src/api/**'
  ---
  ```
- Subfolder instructions files for monorepos ("Specific to this package" section, never
  repeating the root file).

### Step 3: Agent-oriented docs

- `docs/architecture.md`, `docs/conventions.md`, `docs/testing.md`: create or overhaul.
  First line: `> Read this file when: ...`.
- B7 style: conclusion first, justification after, paragraphs ≤ 5 lines, one heading per idea.
  An explanatory tone is allowed here; do not apply the B6 pass to docs.
- Every paragraph > 10 lines of the old root file on a single topic moves here; the root file
  keeps a summary + link or import.
- `docs/adr/0001-...` for each structural decision already visible in the code (Context /
  Decision / Consequences, 20 to 40 lines). Invent nothing.
- No doc copies signatures or file lists.

### Step 4: Skills

- Migrate each `.claude/commands/<name>.md` to `.claude/skills/<name>/SKILL.md` (same `/name`
  invocation), then delete `commands/`.
- For each skill candidate of the plan: frontmatter `name` (= folder, kebab-case),
  `description` "Does X. Use when Y.", body < 500 lines, numbered steps with exact commands,
  `references/` for detail, `scripts/` for what runs.
- Check: `head -5` shows a valid frontmatter; no README in the folder.

### Step 5: Hooks and permissions

- `.claude/settings.json` under version control. Minimal template to adapt:
  ```json
  {
    "permissions": {
      "allow": ["Bash(pnpm test*)", "Bash(pnpm lint*)", "Bash(git status*)", "Bash(git diff*)"],
      "deny": ["Read(.env*)", "Bash(git push --force*)", "Bash(rm -rf /*)"]
    },
    "hooks": {
      "PostToolUse": [
        {
          "matcher": "Edit|Write",
          "hooks": [
            {
              "type": "command",
              "command": "jq -r '.tool_input.file_path' | xargs -r <formatter> 2>/dev/null || true"
            }
          ]
        }
      ],
      "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/hooks/guard-bash.sh" }] }]
    }
  }
  ```
  Hook scripts live in `.claude/hooks/` and are executable. Test each hook by hand (run the
  command with a sample JSON on stdin) before committing.
- Remove from the root file every sentence now guaranteed by a hook; replace it with a one-line
  mention ("automatic formatting via hook").

### Step 6: Subagents

- `.claude/agents/<name>.md` for each role of the plan. Frontmatter: `name`, `description`
  (when to invoke it), `tools` (restricted list), `model`. Body: mission, expected input,
  output format, what it must not do.
- One line per subagent in the "Claude Code workflow" section of the root file.

### Step 7: Lint and maintenance

- `scripts/lint-claude-config.sh` (or an equivalent in the repo's language): root file present
  and ≤ 150 lines, no secret pattern, valid `@` imports and internal links, parsable
  `settings.json`, frontmatter present in each `SKILL.md` and `.claude/agents/*.md`, zero hedge
  words in the root file and the rules (B6 list, as a warning, not an error). Called in CI.
- `docs/agents/CHANGELOG.md` completed with every removed instruction (rule 2).
- `docs/agents/MIGRATION-PLAN.md` marked "executed on <date>".

## Final verification

Run and report:

```bash
wc -l AGENTS.md CLAUDE.md 2>/dev/null
grep -c '^@' AGENTS.md CLAUDE.md 2>/dev/null
find . -name CLAUDE.md -not -path '*/node_modules/*'   # empty if renamed
find .claude/skills -name SKILL.md -exec head -4 {} \;
find .claude/agents -name '*.md' -exec head -5 {} \; 2>/dev/null
jq . .claude/settings.json > /dev/null && echo settings-ok
scripts/lint-claude-config.sh   # or the repo's equivalent, e.g. pnpm agents:check
```

Then, reading only the root file, answer "command to run a single test?" and "where to add an
endpoint?". If you cannot, fix the root file.

Conclude in 5 lines: commits, deleted files, removed instructions (count + CHANGELOG
reference), unmet SHOULDs and why.
