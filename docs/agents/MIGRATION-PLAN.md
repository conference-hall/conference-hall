# Migration plan: Claude Code configuration

**Executed on 2026-11-08** on `chore/setup-agents` (commits `01ac081f` to `652812c8`, then the changelog). Deviations and removals: `docs/agents/CHANGELOG.md`.

Generated on 2026-11-08 by claude-config-audit. Read this file when: you run `claude-config-restructure`.

## Summary

- State: short `CLAUDE.md` (46 lines, ~30 instructions, 0 `@` import) and 14 good topic docs in `docs/`, but no versioned `.claude/` config (`.gitignore:31` ignores all of `.claude`), no hook, no permission, no subagent.
- Per-session load: 103 lines, ~1,240 tokens (`CLAUDE.md` 46 + `~/.claude/CLAUDE.md` 40 + `MEMORY.md` 17), ~8 of them rarely useful.
- Problem 1: the docs' `paths:` (`docs/routes.md:3` etc.) trigger nothing, Claude Code reads this frontmatter only in `.claude/rules/`. Loading relies on the instruction at `CLAUDE.md:30`.
- Problem 2: no "must" rule is deterministic (no `.claude/settings.json`, `lefthook.yml` is optional according to `README.md`).
- Problem 3: doc/code drift (`docs/testing.md:12` contradicts `CLAUDE.md:11`, `docs/i18n.md` ignores x18n introduced in #870, `docs/routes.md:9` says React Router v7 for `react-router ~8.5.1`). Estimated effort: **M**.

On every session Claude loads 103 lines, 8 of them rarely useful (`CLAUDE.md:16` test accounts, `:26` aliases readable in `tsconfig.json`, `:45` test env, `:46` Vite cache, and 4 lines of `MEMORY.md` about closed work).

## Score per section

| Section                  | MUST ok/total | SHOULD ok/total | Blocking points                                           |
| ------------------------ | ------------- | --------------- | --------------------------------------------------------- |
| A. Instructions files    | 1/2           | 0/2             | A2: `CLAUDE.local.md` not ignored                         |
| B. Size and density      | 2/2           | 1/4             | none                                                      |
| C. Structure (not rated) | n/a           | 5/9 sections    | Git, Verification, Claude workflow, Forbidden missing     |
| D. Progressive loading   | 1/1           | 1/2             | none                                                      |
| E. Skills                | 2/2           | 1/2             | skills not versioned (`.gitignore:31`)                    |
| F. Hooks and permissions | 0/1           | 0/3             | F1: no hook, no project `settings.json`                   |
| G. Subagents             | n/a           | 0/2             | none                                                      |
| H. Agent-oriented docs   | 0/1           | 1/3             | H1: `docs/architecture.md`, `docs/conventions.md` missing |
| I. Hygiene               | 0/1 (⚠️)      | 0/2             | I1: drift after #870 and 3199abef                         |

## Findings

### A1 ✅ / A1b ⚠️ Root file name

Proof: `claude --version` → `2.1.319` (≥ 2.1.277); only `./CLAUDE.md` exists (`find . -name CLAUDE.md`); no `CLAUDE.md` in `~/`, `~/dev/`, `~/dev/oss/`; no `AGENTS.md`, `.cursorrules`, `GEMINI.md`, `copilot-instructions.md`.
Fix: `git mv CLAUDE.md AGENTS.md` (no `@` import to resolve). Remaining condition: confirm nobody uses Bedrock/Vertex/Foundry (see Decisions). `~/.claude/CLAUDE.md` stays the user memory, out of scope.

### A2 ❌ Personal files not ignored correctly

Proof: `git check-ignore -v CLAUDE.local.md` returns nothing; `.claude/settings.local.json` is ignored only through the global line `.gitignore:31` (`.claude`), which also prevents versioning skills, rules, agents and `settings.json`.
Fix in `.gitignore`, `# ai` section: replace `.claude` with `.claude/settings.local.json`, `.claude/worktrees/` and add `CLAUDE.local.md`.

### A3 n/a

No area justifies a nested file: topic docs cover the areas through `paths:` (see D2).

### B3 ⚠️ Instructions redundant with the code

Proof: `CLAUDE.md:26` (aliases `~/*`, `tests/*`) is readable in `tsconfig.json`; `CLAUDE.md:16` copies `README.md` (test accounts); `CLAUDE.md:45` (`tests/.env.test`) is found as soon as `vitest.config.ts` is read.
Fix: keep `:26` only for "Imports keep the `.ts`/`.tsx` extension" (not deducible), remove `:45`, keep `:16` (useful for scripted login, see memory `dev-server-scripted-login`).

### B4 ⚠️ Duplicates and contradictions

- `docs/testing.md:12`, `:30`, `:42`: `pnpm test run "<file path>"` (pushes the schema again) versus `CLAUDE.md:11`: `pnpm test:unit run <file>`. Fix: align `docs/testing.md` on `pnpm test:unit run "<file path>"`.
- `CLAUDE.md:23` copies `docs/services.md:9-15` and `:51-57`; `CLAUDE.md:15` copies `docs/database.md:40-42`; `CLAUDE.md:44` copies `docs/testing.md:21-23`. Fix: one map line in `AGENTS.md`, the detail stays in the doc (auto-loaded thanks to D2).
- `docs/routes.md:9` heading says "React Router v7" while `package.json` declares `react-router ~8.5.1`; `README.md` (Stack section) cites "React router v7" and "Express" while the server is Fastify (`servers/web.ts`). Fix: correct both.

### B5 ✅

Commands and architecture first, mostly positive phrasing.

### B6 ⚠️ Style

Numbers for `CLAUDE.md`: **6** instruction lines without a leading imperative verb (`:3`, `:7`, `:30`, `:43`, `:45`, `:46`), **0** hedge words (2 in `docs/database.md`: "when useful" `:21`, "sensible defaults" `:14`), **2** prohibitions without a reason (`:23` "(no repositories)", `:44` "not raw Prisma calls").
Rewrites:

- `CLAUDE.md:7` "Docker (`docker compose up`) must be running for tests, e2e and the dev server (Postgres, Redis, S3 via Garage, Mailpit)." → "Start Docker (`docker compose up`) before `pnpm test`, `pnpm test:e2e` or `pnpm dev`: they need Postgres, Redis, S3 via Garage and Mailpit."
- `CLAUDE.md:46` "Browser tests failing outside the diff with `Invalid hook call` or `useState` on null: stale Vite deps cache, run `rm -rf node_modules/.vite`." → "Run `rm -rf node_modules/.vite` when browser tests fail outside the diff with `Invalid hook call` or `useState` on null: the Vite deps cache is stale."

Prohibitions to complete with their reason (to be given by the human, see Decisions): `:23` why no repositories, `:44` why no raw Prisma.

### C ⚠️ Structure of `CLAUDE.md`

Present: C1 (`:3`, without versions), C2 (`:5-16`, without `pnpm install` nor standalone `pnpm lint`/`pnpm format`), C3 (`:18-26`), C4 (partial through `:28-39`), C9 (`:28-39`).
Missing: C5 Git workflow (the content exists in `docs/contributing.md:11-15`), C6 Verification (only trace: `:14` "Run it before handing work off"), C7 Claude Code workflow, C8 Forbidden (the only one, `:16`, is buried in Commands).
Fix: full draft below.

### D2 ❌ `paths:` docs never loaded automatically

Proof: 14 `docs/*.md` files carry `paths:` (`docs/routes.md:3`, `docs/services.md:3`, ...), but `.claude/rules/` does not exist. Claude Code ignores this frontmatter elsewhere.
Fix: `.claude/rules/<topic>.md` as a symlink to `docs/<topic>.md` (single source, the existing `paths:` frontmatter becomes active). Also: `docs/emails.md:5` `app/features/**/emails/**` matches no tracked file (`git ls-files`), to fix or remove; `docs/logging.md:4` `'**/*.ts'` loads 91 lines as soon as a `.ts` is read, to restrict to `servers/**` and `app/**/*.server.ts` if the human approves.

### D3 ✅

0 `@` import in `CLAUDE.md`.

### E1 ✅ E2 ✅ E3 ✅ / E4 ⚠️

Proof: 3 skills (`claude-config-audit` 115 lines, `claude-config-restructure` 151, `claude-docs-maintain` 120) have `name` = folder and a "Does X. Use when Y." `description`. No `.claude/commands/`.
E4: repeated procedures without a skill (see Candidates). The 3 existing skills are not versioned (A2).

### F1 ❌ Imperative rules without a hook

| Rule                                                     | Source                              | Existing hook or check                        |
| -------------------------------------------------------- | ----------------------------------- | --------------------------------------------- |
| `pnpm check` before handing work off                     | `CLAUDE.md:14`                      | CI `static-tests` only, nothing in session    |
| `pnpm tsc` after adding a route                          | `CLAUDE.md:13`, `docs/routes.md:16` | CI only                                       |
| `pnpm exec prisma generate` after `prisma/schema.prisma` | `CLAUDE.md:15`                      | none                                          |
| Ask before `pnpm db:reset`                               | `CLAUDE.md:16`                      | none (`settings.json` missing)                |
| "After creating test, ALWAYS execute"                    | `docs/testing.md:31`, `:43`, `:60`  | none                                          |
| Sorted `en` and `fr` keys                                | `docs/i18n.md:16-17`                | CI `pnpm i18n:check` (x18n `write.sort`)      |
| Format and lint                                          | `lefthook.yml`                      | optional pre-commit (`README.md`: "optional") |

Fix: `.claude/settings.json` (step 6).

### F2 ❌ F3 ❌

Proof: `.claude/settings.json` missing; only `~/.claude/settings.json` exists (personal `SessionStart` hook).
Fix: `PostToolUse` format hook, `PreToolUse` Bash guard, `Stop` verification reminder; versioned `permissions.allow/ask/deny` (step 6).

### F4 ❌ Readable secrets

Proof: `git ls-files` lists `.env.local` (17 variables including `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET`) and `tests/.env.test`. No `deny` rule.
Fix: `deny: ["Read(./.env.local)"]` if the values are not pure local placeholders (see Decisions). `tests/.env.test` stays readable (`CLAUDE.md:45` points to it).

### F5 n/a

`SessionStart` exists at user level; nothing to add on the project side.

### G1 ❌ G2 ❌

Proof: `.claude/agents/` missing. Repeated roles observed: PR review against `docs/*.md`, writing e2e tests with page objects (`e2e/tests/event-management/proposal.test.ts` changed 10 times in 200 commits).
Fix: 2 subagents (step 8) and one line each in section 7 of `AGENTS.md`.

### H1 ❌ Minimal docs

Proof: `docs/testing.md` ✅; `docs/architecture.md` and `docs/conventions.md` missing.
Fix: create `docs/architecture.md` (content of `CLAUDE.md:18-26` expanded: web/jobs processes, OTel, `services/` ↔ routes boundary, `app/shared` vs `app/features`) and `docs/conventions.md` (topic doc index, naming through `docs/GLOSSARY.md`, import extensions, kebab-case service files, `docs/services.md:134`).

### H2 ❌ No ADR

Fix: `docs/adr/` with 3 decisions already taken in the history: `0001-services-without-repositories.md` (`CLAUDE.md:23`), `0002-node-redis-client.md` (#824), `0003-garage-local-s3.md` (#827).

### H3 ⚠️

Proof: the 14 docs have a `description:` frontmatter, none starts with a "Read this file when" line.
Fix: add `> Read this file when: <task>` after the frontmatter (language to decide, see Decisions).

### H4 ✅

Intent-oriented docs; the code blocks of `docs/services.md` are examples, not copied signatures.

### I1 ⚠️ Updates not systematic

Proof: `4f2cc03d feat: setup x18n (#870)` touched neither `CLAUDE.md` nor `docs/i18n.md` (`git show --stat`), which mentions neither `pnpm i18n:check` nor x18n sorting. `3199abef` did update `CLAUDE.md`.
Fix: add `pnpm i18n:check` to `docs/i18n.md`; I1 rule in section 7 of `AGENTS.md`.

### I2 ⚠️ / I3 ❌

Proof: skill `claude-docs-maintain` present but not versioned; no config lint in CI (`.github/workflows/ci.yml`).
Fix: script `scripts/lint-agent-config.ts` run by a step of the `static-tests` job (step 9).

### Outside the checklist

- `docs/*.md` contains 108 em-dashes (e.g. `docs/testing.md:12`, `docs/GLOSSARY.md` 36) while the user's convention forbids them. Lines rewritten during the migration must drop them.
- `.claude/skills/claude-config-audit/SKILL.md` imposes a heading with an em-dash; this plan uses a colon instead.

## Extraction candidates

### Skills

| Name                   | Description                                                                                                                                                                                            | Proof                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `upgrade-dependencies` | Upgrades pnpm dependencies, regenerates Prisma and runs `pnpm check` then `pnpm test`. Use when asked to upgrade dependencies or a specific library.                                                   | 50 "upgrade" commits out of 200; `package.json` changed 65 times |
| `db-migration`         | Edits `prisma/schema.prisma`, creates the migration `pnpm db:migrate:dev --name=...`, regenerates the client, updates `tests/factories/` and `prisma/seed.ts`. Use when a task changes the data model. | `prisma/schema.prisma` 24 commits, `prisma/seed.ts` 12           |
| `add-route`            | Adds a route: entry in `app/routes.ts`, module with middleware/loader/action, `en`+`fr` keys, `pnpm tsc`, test. Use when a task creates a page or an action.                                           | `app/locales/{en,fr}.translation.json` changed together 38 times |

### Subagents

| Name         | tools                                                 | model  | Role                                                                       |
| ------------ | ----------------------------------------------------- | ------ | -------------------------------------------------------------------------- |
| `reviewer`   | Read, Grep, Glob, Bash(git diff:\*), Bash(git log:\*) | sonnet | Reviews a diff against `docs/*.md` and `docs/GLOSSARY.md`, changes nothing |
| `e2e-writer` | Read, Grep, Glob, Edit, Write, Bash(pnpm test:e2e:\*) | sonnet | Writes Playwright specs and page objects following `docs/testing.md:47-70` |

### Rules (`.claude/rules/`, symlinks to `docs/`)

`api`, `authentication`, `authorization`, `components`, `database`, `emails`, `flags`, `i18n`, `jobs`, `logging`, `redis`, `routes`, `services`, `storage`, `testing`, `tracing`: `paths:` frontmatter already present. `docs/GLOSSARY.md`, `docs/contributing.md`, `docs/privacy.md`, `docs/terms.md`, `docs/code-of-conduct.md` stay outside rules.

### Hooks

| Event         | Matcher       | Command                                                                                                                                                                                            |
| ------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PostToolUse` | `Edit\|Write` | `.claude/hooks/format.sh`: `pnpm exec oxfmt "$file"` then `pnpm exec oxlint --fix "$file"` for `*.ts(x)`                                                                                           |
| `PostToolUse` | `Edit\|Write` | `.claude/hooks/prisma-generate.sh`: `pnpm exec prisma generate` if the file is `prisma/schema.prisma`                                                                                              |
| `PreToolUse`  | `Bash`        | `.claude/hooks/guard-bash.sh`: exit 2 on `git push --force`, `git push * main`, `git push * production`, `prisma migrate reset`                                                                    |
| `Stop`        | (none)        | `.claude/hooks/verify-reminder.sh`: if `git diff --name-only` contains `.ts(x)` changed since the last `pnpm check`, returns the reminder `pnpm check` + `pnpm test:unit run <touched test files>` |

### Docs

| Target file            | Entry line                                                                             | Loading                            |
| ---------------------- | -------------------------------------------------------------------------------------- | ---------------------------------- |
| `docs/architecture.md` | "Read this file when: you add a process, a feature folder, or cross a layer boundary." | link                               |
| `docs/conventions.md`  | "Read this file when: you name a file, class, route or translation key."               | link                               |
| `docs/GLOSSARY.md`     | "Read this file when: you name a domain concept in code, tests or issues."             | link (249 lines, too long for `@`) |
| `docs/adr/*.md`        | "Read this file when: you question why X is done this way."                            | link                               |

## Target tree

```
AGENTS.md                         (formerly CLAUDE.md, ≤ 150 lines)
.gitignore                        (.claude/settings.local.json, .claude/worktrees/, CLAUDE.local.md)
.claude/
├── settings.json                 (permissions + hooks)
├── hooks/
│   ├── format.sh
│   ├── prisma-generate.sh
│   ├── guard-bash.sh
│   └── verify-reminder.sh
├── rules/                        (symlinks → ../../docs/<topic>.md)
│   ├── api.md  authentication.md  authorization.md  components.md
│   ├── database.md  emails.md  flags.md  i18n.md  jobs.md  logging.md
│   └── redis.md  routes.md  services.md  storage.md  testing.md  tracing.md
├── skills/
│   ├── claude-config-audit/SKILL.md
│   ├── claude-config-restructure/SKILL.md
│   ├── claude-docs-maintain/SKILL.md
│   ├── upgrade-dependencies/SKILL.md
│   ├── db-migration/SKILL.md
│   └── add-route/SKILL.md
└── agents/
    ├── reviewer.md
    └── e2e-writer.md
docs/
├── architecture.md               (new)
├── conventions.md                (new)
├── adr/
│   ├── 0001-services-without-repositories.md
│   ├── 0002-node-redis-client.md
│   └── 0003-garage-local-s3.md
├── agents/
│   ├── checklist-2026.md
│   ├── MIGRATION-PLAN.md
│   └── CHANGELOG.md              (new)
├── GLOSSARY.md
├── api.md authentication.md authorization.md components.md database.md emails.md
├── flags.md i18n.md jobs.md logging.md redis.md routes.md services.md storage.md
├── testing.md tracing.md         (+ "Read this file when:" line)
└── contributing.md code-of-conduct.md privacy.md terms.md sponsors/
scripts/
└── lint-agent-config.ts          (new)
```

## Ordered steps

1. **Version `.claude/`**
   Files: `.gitignore`. Commands: replace the `.claude` line with `.claude/settings.local.json`, `.claude/worktrees/`, `CLAUDE.local.md`; `git add .claude/skills`.
   Verification: `git check-ignore .claude/settings.json` exits with code 1; `git check-ignore CLAUDE.local.md` exits with code 0.
   Commit: `chore: version claude code config`

2. **Rename and rewrite the root file**
   Files: `CLAUDE.md` → `AGENTS.md`. Commands: `git mv CLAUDE.md AGENTS.md`, then replace the content with the draft below.
   Verification: `wc -l AGENTS.md` ≤ 150; new session, `/memory` lists `AGENTS.md`; `grep -c '—' AGENTS.md` = 0.
   Commit: `chore: rename CLAUDE.md to AGENTS.md and restructure it`

3. **Enable topic docs as rules**
   Files: `.claude/rules/*.md` (16 links), `docs/emails.md`, `docs/logging.md`. Commands: `mkdir -p .claude/rules && for f in api authentication authorization components database emails flags i18n jobs logging redis routes services storage testing tracing; do ln -s ../../docs/$f.md .claude/rules/$f.md; done`; fix `docs/emails.md:5`.
   Verification: `ls -lL .claude/rules` without a broken link; in a session, read `app/features/event-management/schedule/services/schedule.server.ts` then `/memory` shows `services.md` and `database.md` loaded.
   Commit: `chore: load topic docs as path-scoped rules`

4. **Fix doc drift**
   Files: `docs/testing.md` (`:12`, `:30`, `:42` → `pnpm test:unit run "<file path>"`), `docs/i18n.md` (add `pnpm i18n:check` and x18n sorting), `docs/routes.md:9` (v8), `docs/database.md:14`, `:21` (hedge words), `README.md` Stack section (Fastify, React Router v8), the 16 topic docs (`> Read this file when:` line).
   Verification: `grep -n 'pnpm test run' docs/` empty; `grep -ciE 'when useful|sensible' docs/database.md` = 0; `grep -L 'Read this file when' docs/{api,authentication,authorization,components,database,emails,flags,i18n,jobs,logging,redis,routes,services,storage,testing,tracing}.md` empty.
   Commit: `doc: fix drift between topic docs and code`

5. **Create architecture, conventions and ADRs**
   Files: `docs/architecture.md`, `docs/conventions.md`, `docs/adr/0001-services-without-repositories.md`, `docs/adr/0002-node-redis-client.md`, `docs/adr/0003-garage-local-s3.md`.
   Verification: each ADR 20 to 40 lines with Context / Decision / Consequences; links from `AGENTS.md` valid.
   Commit: `doc: add architecture, conventions and ADRs`

6. **Permissions and hooks**
   Files: `.claude/settings.json`, `.claude/hooks/{format,prisma-generate,guard-bash,verify-reminder}.sh` (`chmod +x`). `permissions` content:
   `allow`: `Bash(pnpm test:unit:*)`, `Bash(pnpm test:e2e:*)`, `Bash(pnpm test:db)`, `Bash(pnpm test)`, `Bash(pnpm check)`, `Bash(pnpm tsc)`, `Bash(pnpm lint:*)`, `Bash(pnpm format:*)`, `Bash(pnpm knip)`, `Bash(pnpm i18n:check)`, `Bash(pnpm exec prisma generate)`, `Bash(git status)`, `Bash(git diff:*)`, `Bash(git log:*)`;
   `ask`: `Bash(pnpm db:reset:*)`, `Bash(pnpm db:migrate:deploy:*)`, `Bash(git push:*)`;
   `deny`: `Read(./.env.local)` (depending on Decisions).
   Verification: `jq . .claude/settings.json`; write a badly formatted `.ts` in a session → reformatted; `git push --force` → blocked with the hook message.
   Commit: `chore: add claude code permissions and hooks`

7. **Domain skills**
   Files: `.claude/skills/upgrade-dependencies/SKILL.md`, `.claude/skills/db-migration/SKILL.md`, `.claude/skills/add-route/SKILL.md`.
   Verification: frontmatter `name` = folder; `description` ≤ 1,024 characters with "Use when"; body < 500 lines.
   Commit: `chore: add upgrade-dependencies, db-migration and add-route skills`

8. **Subagents**
   Files: `.claude/agents/reviewer.md`, `.claude/agents/e2e-writer.md`.
   Verification: `/agents` lists them; `reviewer` has neither Edit nor Write.
   Commit: `chore: add reviewer and e2e-writer subagents`

9. **Config lint in CI**
   Files: `scripts/lint-agent-config.ts`, `package.json` (`agents:check` script), `.github/workflows/ci.yml` (step in `static-tests`), `knip.json` (script entry).
   Checks: `AGENTS.md` present and ≤ 150 lines, no `CLAUDE.md` at the root, valid internal Markdown links in `AGENTS.md` and `docs/*.md`, unbroken `.claude/rules/*` links, `name`/`description` frontmatter of skills and agents.
   Verification: `pnpm agents:check` green; break a link → red.
   Commit: `chore: lint claude code config in CI`

10. **Changelog**
    Files: `docs/agents/CHANGELOG.md` (instructions removed from `CLAUDE.md` and why: `:26` aliases, `:45` env, B4 duplicates).
    Commit: `doc: log agent instruction changes`

## Proposed CLAUDE.md content

```markdown
# AGENTS.md

Conference Hall is a SaaS for managing CFPs: speakers write talks once and submit them to events, organizers review, deliberate, publish results and build schedules.
Stack: Node 26.12, pnpm 12.17, TypeScript 7.0, React 19.3, React Router 8.5 (SSR on Fastify 5), Prisma 7.10 on Postgres, Redis 8 + BullMQ 6, Tailwind 4, Vitest 5.1, Playwright 1.64.
Name domain concepts exactly as `docs/GLOSSARY.md` defines them, in code, tests and issues.

## Commands

Start Docker (`docker compose up`) before `pnpm test`, `pnpm test:e2e` or `pnpm dev`: they need Postgres, Redis, S3 via Garage and Mailpit.

- `pnpm install`: install dependencies.
- `pnpm dev`: web server (port 3000) and the BullMQ jobs worker together.
- `pnpm test`: push the Prisma schema to the test DB, then run all Vitest projects.
- `pnpm test:unit run <file>`: one Vitest file, without the schema push. Run `pnpm test:db` first if the schema changed.
- `pnpm test:e2e <file>`: one Playwright spec.
- `pnpm tsc`: `react-router typegen` then `tsc -b`. Run it after adding or changing routes so `./+types/*` exist.
- `pnpm lint` / `pnpm format`: oxlint / oxfmt.
- `pnpm check`: the CI static job (format, lint, tsc, knip, i18n).
- `pnpm exec prisma generate`: after any `prisma/schema.prisma` change.
- `pnpm db:migrate:dev --name="..."`: new migration.
- `pnpm db:reset`: reseed the local dev DB (users `superman@example.com` / `batman@example.com`, password `password`).

## Architecture

- `servers/web.ts`: Fastify server mounting React Router SSR, plugins in `servers/fastify/`. `servers/jobs.ts`: separate BullMQ worker. Both load OpenTelemetry via `--import`.
- `app/routes.ts`: all routes, declared programmatically, pointing to route modules in feature folders.
- `app/features/<area>/`: vertical slices. Route modules at the top level, `components/`, `services/`, `models/` siblings.
- `services/*.server.ts`: all business logic and DB access. Keep DB access out of route modules and components.
- Authorization: middleware chain on route modules (`requireAuth → requireAuthorizedTeam → requireAuthorizedEvent`), services check `permissions.canXxx`.
- `app/shared/`: cross-feature infrastructure. `app/design-system/`: UI kit. `app/app-platform/`: app shell, SEO, legal pages.
- Details and boundaries: [docs/architecture.md](docs/architecture.md).

## Conventions

- Keep the `.ts`/`.tsx` extension in imports.
- Build services with `Class.for(authorizedContext)`, `Class.of(id)` or `Class.with(token)`, one class per file: see `docs/services.md`.
- Add every translation key to both `app/locales/en.*.json` and `app/locales/fr.*.json`: `pnpm i18n:check` fails otherwise.
- Create test data with `tests/factories/` (traits + attributes), never raw Prisma calls: <reason to provide>.
- Topic conventions load automatically from `.claude/rules/` when you touch matching files. Index: [docs/conventions.md](docs/conventions.md).

## Git workflow

- Branch features and fixes from `main`; branch hotfixes from `production`, then apply them to `main`.
- Write commit subjects as `<type>: <summary>` with type in `feat`, `fix`, `refactor`, `chore`, `doc`, `perf`, `test`.
- Make several small commits per PR: PRs are squashed on merge.
- Never commit `CLAUDE.local.md` or `.claude/settings.local.json`: they hold personal overrides.

## Verification

- Run `pnpm test:unit run <file>` on every test file you create or change, `pnpm test:e2e <file>` for Playwright specs.
- Run `pnpm check` before handing work off: it mirrors the CI `static-tests` job.
- Run `pnpm tsc` after touching `app/routes.ts`.
- Run `rm -rf node_modules/.vite` when browser tests fail outside the diff with `Invalid hook call` or `useState` on null: the Vite deps cache is stale.

## Claude Code workflow

- Enter plan mode for tasks touching more than 5 files or `prisma/schema.prisma`.
- Use the `db-migration` skill for any schema change, `add-route` for a new page or action, `upgrade-dependencies` for dependency bumps.
- Ask the `reviewer` subagent to review a branch against `docs/` before opening a PR.
- Ask the `e2e-writer` subagent to write or fix Playwright specs and page objects.
- Update `AGENTS.md` and the matching `docs/*.md` in the same commit as any command, stack or convention change.
- Create git worktrees outside the repo: tools in the main checkout would scan them.

## Forbidden

- Never run `pnpm db:reset` without asking: it wipes the local dev DB.
- Never add a repository layer over Prisma: <reason to provide, see docs/adr/0001-services-without-repositories.md>.
- Never push to `main` or `production` directly: changes go through PRs and CI.

## More

- [docs/architecture.md](docs/architecture.md), [docs/conventions.md](docs/conventions.md), [docs/GLOSSARY.md](docs/GLOSSARY.md), [docs/adr/](docs/adr/)
- Topic docs (auto-loaded as rules): `docs/{api,authentication,authorization,components,database,emails,flags,i18n,jobs,logging,redis,routes,services,storage,testing,tracing}.md`
```

## Decisions for the human

1. **Rename to `AGENTS.md`?** Claude Code found: `2.1.319` (≥ 2.1.277), no parent `CLAUDE.md`, 0 `@` import. Only unknown: does a contributor use Bedrock, Vertex or Foundry? If so, keep `CLAUDE.md`.
2. **Version `.claude/`?** `.gitignore:31` ignores it entirely, maybe on purpose (personal skills). Without this change, steps 3, 6, 7, 8 stay local to your machine.
3. **Rules as symlinks or copies?** Links keep `docs/` as the single source; a copy in `.claude/rules/` would drift. Confirm Windows contributors are not concerned.
4. **`.env.local`:** are the secrets tracked by Git dev placeholders? If not, remove them from history; if so, is `deny Read(./.env.local)` still useful?
5. **Missing reasons:** why no repositories (`CLAUDE.md:23`) and why no raw Prisma in tests (`CLAUDE.md:44`)? They feed `AGENTS.md` and ADR 0001.
6. **Language of the docs' entry line:** `> Read this file when:` (consistent with English docs) or `> Lis ce fichier quand :` (checklist wording)?
7. **`docs/logging.md`:** restrict `paths: '**/*.ts'` to `servers/**` and `app/**/*.server.ts`?
8. **`Stop` hook:** a simple reminder, or a real run of `pnpm lint` + `pnpm format:check` (a few seconds at the end of each turn)?
9. **Subagent model:** `sonnet` for `reviewer` and `e2e-writer`, or `opus` for `reviewer`? The `mattpocock-skills:code-review` plugin already covers a review: keep `reviewer` as well?
10. **Em-dashes:** remove the 108 em-dashes from `docs/*.md` during the migration (your global convention) or only on rewritten lines?

## Human answers (2026-11-08)

1. Rename to `AGENTS.md`: yes, nobody uses Bedrock, Vertex or Foundry.
2. Version `.claude/`: yes.
3. Rules: symlinks to `docs/`.
4. `.env.local`: dev placeholders, no `deny`.
5. Reasons: no repository because Prisma is already the abstraction (a repository would duplicate its typed API for no gain); factories because they provide valid defaults and traits (a schema change is fixed in one place) and keep the test focused on the attributes that matter.
6. Docs entry line: `> Read this file when:`.
7. `docs/logging.md`: restrict to `servers/**` and `app/**/*.server.ts`.
8. `Stop` hook: really run `pnpm lint` + `pnpm format:check`.
9. Subagents: `e2e-writer` only, on `sonnet`; no `reviewer` (covered by `mattpocock-skills:code-review`).
10. Em-dashes: remove all of them from `docs/*.md`.

Branch: `chore/setup-agents` (current branch).
