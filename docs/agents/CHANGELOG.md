# Agent instructions changelog

Every instruction removed, moved or rewritten during the Claude Code config restructuring (`docs/agents/MIGRATION-PLAN.md`), with the reason.

## 2026-11-08: `CLAUDE.md` → `AGENTS.md`

### Removed

- `CLAUDE.md:26` "Path aliases: `~/*` → `app/*`, `tests/*` → `tests/*`": readable in `tsconfig.json` (B3). The second half ("Imports keep the `.ts`/`.tsx` extension") is kept.
- `CLAUDE.md:44` "Vitest globals are available without imports.": duplicate of `docs/testing.md` ("All Vitest functions ... globally available"), loaded as a rule on `**/*.test.*`.
- `CLAUDE.md:45` "Test DB env comes from `tests/.env.test`.": found as soon as `vitest.config.ts` is read (B3).
- `CLAUDE.md:30` "Each file in `docs/` with a `paths:` frontmatter is the convention reference for those paths. Read the matching one before editing in its area": replaced by automatic loading through `.claude/rules/` (symlinks to `docs/`, step 3).

### Moved

- `CLAUDE.md:32-39` (topic doc descriptions): moved to `docs/conventions.md` (index). `AGENTS.md` keeps the file list.

### Rewrites

- `:3` "Domain terms are defined in `docs/GLOSSARY.md`; use them as written there when naming things in code, tests and issues." → "Name domain concepts exactly as `docs/GLOSSARY.md` defines them, in code, tests and issues." Kept: path, scope.
- `:7` "Docker (`docker compose up`) must be running for tests, e2e and the dev server (Postgres, Redis, S3 via Garage, Mailpit)." → "Start Docker (`docker compose up`) before `pnpm test`, `pnpm test:e2e` or `pnpm dev`: they need Postgres, Redis, S3 via Garage and Mailpit." Kept: command, services, reason.
- `:14` "Run it before handing work off." → Verification section "Run `pnpm check` before handing work off: it mirrors the CI `static-tests` job." Kept: command, reason.
- `:13` "Run it after adding or changing routes so `./+types/*` exist." → kept in Commands, repeated in Verification as "Run `pnpm tsc` after touching `app/routes.ts`."
- `:15` "`pnpm exec prisma generate` after any `prisma/schema.prisma` change; new migrations via `pnpm db:migrate:dev --name="..."`." → two Commands lines (one rule per line).
- `:16` "It is destructive, so ask before running it." → Forbidden section "Never run `pnpm db:reset` without asking: it wipes the local dev DB." Kept: command, reason. The test accounts stay in Commands.
- `:20-25` Architecture: rephrased as a `path: role` map, every path, plugin name, folder and example kept.
- `:23` "one class per file built via `Class.for(authorizedContext)` or `Class.of(id)`" → Conventions "Build services with `Class.for(authorizedContext)`, `Class.of(id)` or `Class.with(...)`, one class per file". `Class.with` added: used in the code (`event-search.server.ts`, `submission-pass-claim.server.ts`).
- `:23` "(no repositories)" → Forbidden "Never add a repository layer over Prisma: Prisma is already the data-access abstraction, a repository would duplicate its typed API for no gain." Reason given by the human.
- `:38` "translation keys (`en` and `fr`, both files, sorted)" → Conventions "Add every translation key to both `app/locales/en.*.json` and `app/locales/fr.*.json`, sorted: `pnpm i18n:check` fails otherwise."
- `:43` "Vitest has two projects: ..." → "Expect two Vitest projects: ..." Kept: globs, Node vs Chromium, real DB, serial runs, truncation.
- `:44` "Create test data with `tests/factories/` (traits + attributes), not raw Prisma calls." → reason given by the human added (valid defaults, a single place to fix, readable tests).
- `:46` "Browser tests failing outside the diff ... stale Vite deps cache, run `rm -rf node_modules/.vite`." → "Run `rm -rf node_modules/.vite` when browser tests fail outside the diff with `Invalid hook call` or `useState` on null: the Vite deps cache is stale."
- `:46` "Create git worktrees outside the repo so tools in the main checkout do not scan them." → separate line in Claude Code workflow (two rules, two lines).

### Added

- Stack with versions (C1), `pnpm install`, `pnpm lint` / `pnpm format` (C2), Git workflow (from `docs/contributing.md`), Verification, Claude Code workflow and Forbidden sections (C5 to C8).

## 2026-11-08: topic docs as rules

- `.claude/rules/*.md`: 16 symlinks to `docs/` (decision 3). The existing `paths:` become active; verified in a session (reading a service loads `services.md`, `database.md`, `logging.md`).
- `docs/emails.md` `paths:` "`app/features/**/emails/**`" (no tracked file) → "`app/features/event-management/settings/emails*.tsx`" (email customization pages).
- `docs/logging.md` `paths:` "`'**/*.ts'`" → "`servers/**`", "`app/**/*.server.ts`" (decision 7): 91 lines were loaded for every `.ts` read.

## 2026-11-08: topic doc drift

### Rewrites

- `docs/testing.md` (3 occurrences) "`pnpm test run "<file path>"`" → "`pnpm test:unit run "<file path>"`": the old command pushed the schema again for every test.
- `docs/routes.md` "React Router v7" → "v8" (heading and `description`), `docs/authorization.md` "React Router v7 middleware" → "React Router middleware": `package.json` declares `react-router ~8.5.1`.
- `README.md` Stack "React router v7", "Express" → "React Router v8", "Fastify": the server is `servers/web.ts` (Fastify).
- `docs/database.md` "Use `@default()` for sensible defaults: booleans, timestamps, JSON" → "Set `@default()` on booleans, timestamps and JSON columns". Kept: examples `@default("[]")`, `@default("{}")`.
- `docs/database.md` "Add `@@index()` on foreign key columns when useful for optimization" → "... that queries filter or join on". Hedge replaced by a criterion.
- `docs/components.md` "Prefer composition over prop drilling [dash] extract sub-components when complexity grows" → "Use composition instead of prop drilling: extract sub-components when complexity grows".
- `docs/i18n.md` "Keys must be **alphabetically sorted**" → "Keys must be **sorted** in translation files: x18n sorts them (`write.sort: 'binary'`)"; `pnpm i18n:check` added (#870 had not updated the doc).
- `docs/GLOSSARY.md` reference `CLAUDE.md` → `AGENTS.md`.
- 16 topic docs: `> Read this file when: ...` added after the frontmatter (H3).
- Em-dashes in `docs/*.md` (108) removed (decision 10): a colon for the "term, dash, definition" and "rule, dash, reason" patterns, a targeted rewrite for 11 sentences (`authorization.md`, `emails.md`, `logging.md`, `GLOSSARY.md`). No content removed.

## 2026-11-08: architecture, conventions, ADR

- Created: `docs/architecture.md` (expands the Architecture section of `AGENTS.md`), `docs/conventions.md` (receives the annotated topic doc index, formerly `CLAUDE.md:30-39`, and the alias convention, formerly `CLAUDE.md:26`), `docs/adr/0001-services-without-repositories.md`.
- Not created: ADR 0002 (node-redis, #824) and 0003 (Garage, #827) planned by the plan. Neither the commit nor the PR gives the reason, and the human chose not to write them rather than invent one.

## 2026-11-08: permissions and hooks

- `AGENTS.md` "`pnpm exec prisma generate`: after any `prisma/schema.prisma` change.": the command stays, the rule is guaranteed by `.claude/hooks/prisma-generate.sh`.
- `AGENTS.md` "Never push to `main` or `production` directly": kept, guaranteed by `.claude/hooks/guard-bash.sh` (which also blocks force pushes and `prisma migrate reset`).
- Added: a one-line mention of automatic formatting (`format.sh`) and of the Stop hook (`stop-check.sh`, runs `pnpm lint` + `pnpm format:check`, decision 8).
- Plan: `verify-reminder.sh` replaced by `stop-check.sh` (real run instead of a reminder, decision 8). No `deny Read(./.env.local)`: dev placeholders (decision 4).

## 2026-11-08: skills and subagent

- Added: skills `upgrade-dependencies`, `db-migration`, `add-route` (repeated procedures, see plan E4).
- Added: subagent `e2e-writer` (`sonnet`). No `reviewer` (decision 9): reviews go through `mattpocock-skills:code-review`. The `reviewer` line of the `AGENTS.md` draft was not kept and the commit is named `chore: add e2e-writer subagent`.

## 2026-11-08: config lint

- Added: `scripts/lint-agent-config.ts`, `pnpm agents:check` (also part of `pnpm check`), "Check agent config" step in the CI `static-tests` job. `AGENTS.md` cites both commands.
- Plan: no `knip.json` entry, knip finds the script through `package.json`. The skill cited `scripts/lint-claude-config.sh`; the plan (TypeScript, like the rest of the repo) wins.

## 2026-11-08: English only

- Added to `AGENTS.md` Conventions: "Write everything committed to the repo in English (code, comments, tests, docs, ADRs, skills, subagents, commit messages, PR descriptions): it is the project language. Only `app/locales/fr.*.json` holds French." Requested by the human.
- Translated to English: `e2e-writer`, the 6 project skills, and `docs/agents/` (`checklist-2026.md`, `MIGRATION-PLAN.md`, this file). Skill descriptions now follow "Does X. Use when Y." and docs open with "Read this file when:". The French hedge words stay in the B6 grep patterns and in `scripts/lint-agent-config.ts`, since they detect French text.
