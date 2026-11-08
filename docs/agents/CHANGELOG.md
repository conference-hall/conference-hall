# Agent instructions changelog

Every instruction removed, moved or rewritten during the Claude Code config restructuring (`docs/agents/MIGRATION-PLAN.md`), with the reason.

## 2026-11-08: `CLAUDE.md` → `AGENTS.md`

### Retirés

- `CLAUDE.md:26` "Path aliases: `~/*` → `app/*`, `tests/*` → `tests/*`": lisible dans `tsconfig.json` (B3). La seconde moitié ("Imports keep the `.ts`/`.tsx` extension") est conservée.
- `CLAUDE.md:44` "Vitest globals are available without imports.": doublon de `docs/testing.md` ("All Vitest functions ... globally available"), chargé comme rule sur `**/*.test.*`.
- `CLAUDE.md:45` "Test DB env comes from `tests/.env.test`.": découvert dès la lecture de `vitest.config.ts` (B3).
- `CLAUDE.md:30` "Each file in `docs/` with a `paths:` frontmatter is the convention reference for those paths. Read the matching one before editing in its area": remplacé par le chargement automatique via `.claude/rules/` (liens symboliques vers `docs/`, étape 3).

### Déplacés

- `CLAUDE.md:32-39` (descriptions des docs thématiques): déplacées dans `docs/conventions.md` (index). `AGENTS.md` garde la liste des fichiers.

### Réécritures

- `:3` "Domain terms are defined in `docs/GLOSSARY.md`; use them as written there when naming things in code, tests and issues." → "Name domain concepts exactly as `docs/GLOSSARY.md` defines them, in code, tests and issues." Conservé : chemin, portée.
- `:7` "Docker (`docker compose up`) must be running for tests, e2e and the dev server (Postgres, Redis, S3 via Garage, Mailpit)." → "Start Docker (`docker compose up`) before `pnpm test`, `pnpm test:e2e` or `pnpm dev`: they need Postgres, Redis, S3 via Garage and Mailpit." Conservé : commande, services, raison.
- `:14` "Run it before handing work off." → section Vérification "Run `pnpm check` before handing work off: it mirrors the CI `static-tests` job." Conservé : commande, raison.
- `:13` "Run it after adding or changing routes so `./+types/*` exist." → conservé en Commandes, doublé en Vérification "Run `pnpm tsc` after touching `app/routes.ts`."
- `:15` "`pnpm exec prisma generate` after any `prisma/schema.prisma` change; new migrations via `pnpm db:migrate:dev --name="..."`." → deux lignes de Commandes (une règle par ligne).
- `:16` "It is destructive, so ask before running it." → section Interdits "Never run `pnpm db:reset` without asking: it wipes the local dev DB." Conservé : commande, raison. Les comptes de test restent en Commandes.
- `:20-25` Architecture : reformulées en carte `chemin: rôle`, tous les chemins, noms de plugins, dossiers et exemples conservés.
- `:23` "one class per file built via `Class.for(authorizedContext)` or `Class.of(id)`" → Conventions "Build services with `Class.for(authorizedContext)`, `Class.of(id)` or `Class.with(...)`, one class per file". `Class.with` ajouté : utilisé dans le code (`event-search.server.ts`, `submission-pass-claim.server.ts`).
- `:23` "(no repositories)" → Interdits "Never add a repository layer over Prisma: Prisma is already the data-access abstraction, a repository would duplicate its typed API for no gain." Raison fournie par l'humain.
- `:38` "translation keys (`en` and `fr`, both files, sorted)" → Conventions "Add every translation key to both `app/locales/en.*.json` and `app/locales/fr.*.json`, sorted: `pnpm i18n:check` fails otherwise."
- `:43` "Vitest has two projects: ..." → "Expect two Vitest projects: ..." Conservé : globs, Node vs Chromium, DB réelle, sérialisation, troncature.
- `:44` "Create test data with `tests/factories/` (traits + attributes), not raw Prisma calls." → ajout de la raison fournie par l'humain (défauts valides, un seul endroit à corriger, tests lisibles).
- `:46` "Browser tests failing outside the diff ... stale Vite deps cache, run `rm -rf node_modules/.vite`." → "Run `rm -rf node_modules/.vite` when browser tests fail outside the diff with `Invalid hook call` or `useState` on null: the Vite deps cache is stale."
- `:46` "Create git worktrees outside the repo so tools in the main checkout do not scan them." → ligne séparée en Workflow Claude Code (deux règles, deux lignes).

### Ajoutés

- Stack avec versions (C1), `pnpm install`, `pnpm lint` / `pnpm format` (C2), sections Workflow Git (depuis `docs/contributing.md`), Vérification, Workflow Claude Code, Interdits (C5 à C8).
