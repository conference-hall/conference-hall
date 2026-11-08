# Checklist: Claude Code configuration (state of the art, November 2026)

Source of truth shared by the `claude-config-audit`, `claude-config-restructure` and
`claude-docs-maintain` skills. Every criterion is phrased so an agent can verify it.

Legend: **[MUST]** blocking · **[SHOULD]** recommended · **[MAY]** optional.

Convention: below, "`CLAUDE.md`" means the root instructions file, whether it is named
`CLAUDE.md` or `AGENTS.md` (see A1b).

---

## A. Instructions files

- **A1 [MUST]** A single root instructions file, the only source of truth. No other file
  (`.cursorrules`, `GEMINI.md`, `copilot-instructions.md`) carries duplicated content; if they
  exist without use, delete them.
- **A1b [SHOULD]** This file is named `AGENTS.md`, not `CLAUDE.md`. Claude Code ≥ 2.1.277
  (Sept. 2026) reads `AGENTS.md` natively when no `CLAUDE.md` exists in the folder or in a
  parent. The neutral name avoids a future rename and the content stays the same.
  Conditions: `claude --version` ≥ 2.1.277, no leftover `CLAUDE.md` in a parent (`~/`
  included, except `~/.claude/CLAUDE.md` which stays the user memory), and a check after the
  rename that `@` imports still resolve; otherwise convert them to Markdown links. If the
  version is older or the team uses Bedrock/Vertex/Foundry (not supported yet at that date),
  keep `CLAUDE.md`.
- **A2 [MUST]** `CLAUDE.local.md` (personal overrides) and `.claude/settings.local.json` in
  `.gitignore`.
- **A3 [SHOULD]** Subfolder instructions file (`apps/web/AGENTS.md`, same name as the root)
  for what concerns only one area: loaded only when Claude works there, never repeating the
  root. Never mix both names in one repo: a nested `CLAUDE.md` makes Claude ignore `AGENTS.md`
  in its whole subtree.
- **A4 [MAY]** `~/.claude/CLAUDE.md` for cross-project personal preferences (response style,
  language); nothing project-specific lives there.

## B. Size and density of the root file

- **B1 [MUST]** `CLAUDE.md` ≤ 150 lines and ≤ ~100 imperative instructions. Beyond that,
  adherence drops: what is rarely useful moves to files loaded on demand.
- **B2 [MUST]** Every instruction is specific and verifiable. Forbidden: "write clean code",
  "follow best practices". Expected: "`pnpm test --filter <pkg>` before every commit", "never
  `any` without a `// why:` comment".
- **B3 [SHOULD]** Remove every instruction Claude already follows without it (test by removing
  it).
- **B4 [SHOULD]** No duplication with what is readable elsewhere (README, package.json,
  schema): point to the file, do not copy it.
- **B5 [SHOULD]** Most important instructions first; positive phrasing ("do X") except for real
  prohibitions.
- **B6 [SHOULD]** Writing style of instructions (root file, rules, skill bodies):
  - one instruction per line, leading imperative verb ("Run", "Use", "Never commit");
  - no hedge words ("if possible", "generally", "it would be better", "try to"): either it is a
    rule, or it is not written;
  - active voice, no politeness, no introductory sentence ("This project cares about...");
  - the reason stays, as a short clause after a colon ("never `any`: it breaks downstream
    inference");
  - exact commands, paths and names kept as is; a do/don't example beats an adjective.
  - **Guardrails**: simplifying never allows (a) replacing a concrete detail with a generic
    term ("run the tests" instead of the command), (b) removing the reason of a rule,
    (c) merging two rules into one sentence, (d) removing an example. If the short version
    loses one of these, the long version stays.
  - Line test: it starts with an imperative verb, or it is a command, a path, a heading, a
    table or a reason attached to the previous line. Otherwise, rewrite it or move it to docs.
- **B7 [MAY]** Docs loaded on demand (`docs/**`, ADRs, skill `references/`): explanatory tone
  allowed, but conclusion first then justification, paragraphs ≤ 5 lines, one heading per idea
  so Claude can skip what does not concern it.

## C. Expected structure of `CLAUDE.md`

Sections in this order (omit empty ones):

1. **Project in one sentence** + stack (pinned versions).
2. **Commands**: install, dev, build, test (unit / e2e / single file), lint, typecheck,
   format. Exact, copy-pasteable.
3. **Architecture**: folder map (5 to 15 lines), entry points, boundaries not to cross.
4. **Conventions**: naming, structure of a typical module, errors, logs, i18n if relevant.
5. **Git workflow**: branches, commit format, expected PR content, what must never be
   committed.
6. **Verification**: how Claude proves the work is done (tests to run, screenshots, CI
   checks). The most valuable section.
7. **Claude Code workflow**: plan mode for tasks > N files, `/clear` between tasks, one commit
   per step, when to call which subagent or skill.
8. **Forbidden**: short list, each line with its reason.
9. **Where to find more**: `@docs/architecture.md`, rules, skills.

## D. Progressive disclosure

- **D1 [MUST]** Long details (full style guide, ADRs, release procedures, schemas) live in
  `docs/` or in skills; `CLAUDE.md` points to them with `@path` (inline import) or a Markdown
  link depending on whether they should always load or load on demand.
- **D2 [SHOULD]** `.claude/rules/<topic>.md` with a `paths: ["src/api/**"]` frontmatter for
  rules scoped to file areas: loaded only when Claude touches those files. Without `paths`, a
  `rules/` file loads on every session: keep that for truly global rules you want out of
  `CLAUDE.md` by topic.
- **D3 [SHOULD]** `@` imports: at most 3 to 5 in `CLAUDE.md`, only for what every session
  needs. Everything else as a Markdown link (Claude reads the file when it needs it).
- **D4 [MAY]** Import depth ≤ 2 (an imported file that imports another one).

## E. Skills (`.claude/skills/<name>/SKILL.md`)

- **E1 [MUST]** YAML frontmatter `name` (kebab-case = folder name) + `description`.
- **E2 [MUST]** `description` says _what the skill does_ **and when to use it**: the only text
  read before triggering (~1,024 characters max).
- **E3 [SHOULD]** Body < 500 lines / ~5,000 tokens; detail in `references/`, `scripts/`,
  `assets/`, one level deep.
- **E4 [SHOULD]** Candidates: any procedure repeated > 2 times (release, DB migration, adding
  an endpoint, review against the in-house grid). Old `.claude/commands/*.md` are migrated to
  skills (same `/name` invocation, more capabilities).
- **E5 [MAY]** No `README.md`/`CHANGELOG.md` in a skill; scripts take arguments instead of
  being edited.

## F. Determinism: hooks and permissions over prose

- **F1 [MUST]** Every rule that _must_ be followed (formatting, no push to `main`, secrets,
  running tests) is a hook or a CI check, not a sentence in `CLAUDE.md`. File:
  `.claude/settings.json` → `hooks` (`PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`,
  `UserPromptSubmit`...).
- **F2 [SHOULD]** `PostToolUse` (Edit|Write) → formatter; `PreToolUse` (Bash) → blocks
  `git push --force`, `rm -rf` outside the repo, the project's destructive commands; `Stop` →
  reminder or test run when files changed.
- **F3 [SHOULD]** `permissions.allow` / `deny` under version control in
  `.claude/settings.json` (e.g. `allow: ["Bash(pnpm test*)"]`, `deny: ["Read(.env*)"]`);
  personal settings in `settings.local.json`.
- **F4 [SHOULD]** Secrets and large files excluded from reading (`.claudeignore` or `deny`).
- **F5 [MAY]** A `SessionStart` hook that prints the repo state (branch, failing tests, TODOs)
  so Claude does not rediscover it on every session.

## G. Subagents (`.claude/agents/<name>.md`)

- **G1 [SHOULD]** One subagent per repeated role: `reviewer`, `test-writer`, `migrator`,
  `explorer`. Frontmatter `name`, `description` (when to invoke it), `tools` (restricted),
  `model` (haiku/sonnet for mechanical tasks).
- **G2 [SHOULD]** In `CLAUDE.md` section 7, one line per subagent: when to call it.
- **G3 [MAY]** Persistent memory (`memory: project`) only for agents with a proven benefit
  (e.g. a reviewer that learns false positives).

## H. Agent-oriented project documentation

- **H1 [MUST]** `docs/` contains at least `architecture.md` (structural decisions, not a
  tutorial), `conventions.md` (the full guide `CLAUDE.md` summarizes), `testing.md`
  (strategy, typical test, fixtures).
- **H2 [SHOULD]** Architecture decisions as short ADRs (`docs/adr/NNNN-title.md`, 20 to 40
  lines: Context / Decision / Consequences).
- **H3 [SHOULD]** Every doc starts with `> Read this file when: ...`.
- **H4 [SHOULD]** No doc copies the code (signatures, file lists): describe the intent, point
  to the code.
- **H5 [MAY]** `docs/agents/`: migration plan, `CHANGELOG.md` of removed/added instructions
  and why, maintenance reports.

## I. Hygiene and maintenance

- **I1 [MUST]** `CLAUDE.md` updated in the same commit as any command, stack or convention
  change.
- **I2 [SHOULD]** Monthly or quarterly review: remove instructions that never trigger, promote
  violated ones to hooks, turn repeated procedures into skills.
- **I3 [SHOULD]** Minimal CI lint: file present, ≤ 150 lines, no secret, valid `@` imports and
  internal links, valid skill and agent frontmatter.
- **I4 [MAY]** Use `#` during a session to add an instruction to `CLAUDE.md`, then review it
  at the next commit: what gets in fast must be pruned fast.

---

## Anti-patterns to always report

| Symptom                                           | Problem                                  | Fix                                       |
| ------------------------------------------------- | ---------------------------------------- | ----------------------------------------- |
| `CLAUDE.md` > 200 lines                           | Rules drowned, weak adherence            | Split (D1, D2), prune (B3)                |
| 10 `@` imports at the top                         | Everything loaded each session, full ctx | Keep 3 to 5, the rest as links (D3)       |
| "Always run the tests" in prose, never done       | Not deterministic                        | `Stop`/`PreToolUse` hook (F1)             |
| List of every project file                        | Stale after every PR                     | Folder map (H4)                           |
| Vague style instructions                          | Not verifiable                           | Concrete do/don't examples (B2)           |
| 1,200-line skill                                  | Never read in full                       | Short body + `references/` (E3)           |
| Skill `description` = its name                    | Never triggered                          | "Does X. Use when Y." (E2)                |
| `.claude/commands/` and `.claude/skills/` coexist | Duplicate mechanisms                     | Migrate to skills (E4)                    |
| Orphan `.cursorrules` or `GEMINI.md`              | Silent drift                             | Delete (A1)                               |
| `CLAUDE.md` and `AGENTS.md` coexist               | `AGENTS.md` ignored, guaranteed drift    | A single name, `AGENTS.md` (A1b)          |
| "It would be better to...", "if possible"         | Rule read as a suggestion                | Imperative or removal (B6)                |
| Rule shortened to "write tests"                   | Precision lost, not actionable           | Restore the exact command (B6 guardrails) |
| Prohibition without a reason                      | Does not generalize to unlisted cases    | Add the reason as a clause (B6)           |
