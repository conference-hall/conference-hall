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

## 2026-11-08: dérive des docs thématiques

### Réécritures

- `docs/testing.md` (3 occurrences) "`pnpm test run "<file path>"`" → "`pnpm test:unit run "<file path>"`": l'ancienne commande relançait le push du schéma à chaque test.
- `docs/routes.md` "React Router v7" → "v8" (titre et `description`), `docs/authorization.md` "React Router v7 middleware" → "React Router middleware": `package.json` déclare `react-router ~8.5.1`.
- `README.md` Stack "React router v7", "Express" → "React Router v8", "Fastify": le serveur est `servers/web.ts` (Fastify).
- `docs/database.md` "Use `@default()` for sensible defaults: booleans, timestamps, JSON" → "Set `@default()` on booleans, timestamps and JSON columns". Conservé : exemples `@default("[]")`, `@default("{}")`.
- `docs/database.md` "Add `@@index()` on foreign key columns when useful for optimization" → "... that queries filter or join on". Modalisateur remplacé par un critère.
- `docs/components.md` "Prefer composition over prop drilling — extract sub-components when complexity grows" → "Use composition instead of prop drilling: extract sub-components when complexity grows".
- `docs/i18n.md` "Keys must be **alphabetically sorted**" → "Keys must be **sorted** in translation files: x18n sorts them (`write.sort: 'binary'`)"; ajout de `pnpm i18n:check` (#870 n'avait pas mis la doc à jour).
- `docs/GLOSSARY.md` renvoi `CLAUDE.md` → `AGENTS.md`.
- 16 docs thématiques : ajout de `> Read this file when: ...` après le frontmatter (H3).
- Em-dashes de `docs/*.md` (108) retirés (décision 10) : deux-points pour les motifs "terme — définition" et "règle — raison", réécriture ciblée pour 11 phrases (`authorization.md`, `emails.md`, `logging.md`, `GLOSSARY.md`). Aucun contenu retiré.

## 2026-11-08: architecture, conventions, ADR

- Créés : `docs/architecture.md` (développe la section Architecture d'`AGENTS.md`), `docs/conventions.md` (reçoit l'index commenté des docs thématiques, ex-`CLAUDE.md:30-39`, et la convention d'alias ex-`CLAUDE.md:26`), `docs/adr/0001-services-without-repositories.md`.
- Non créés : ADR 0002 (node-redis, #824) et 0003 (Garage, #827) prévus par le plan. Ni le commit ni la PR ne donnent le motif, et l'humain a choisi de ne pas les écrire plutôt que d'inventer une raison.

## 2026-11-08: permissions et hooks

- `AGENTS.md` "`pnpm exec prisma generate`: after any `prisma/schema.prisma` change." : la commande reste, la règle est garantie par `.claude/hooks/prisma-generate.sh`.
- `AGENTS.md` "Never push to `main` or `production` directly" : conservé, garanti par `.claude/hooks/guard-bash.sh` (bloque aussi les force push et `prisma migrate reset`).
- Ajouté : mention d'une ligne du formatage automatique (`format.sh`) et du hook Stop (`stop-check.sh`, lance `pnpm lint` + `pnpm format:check`, décision 8).
- Plan : `verify-reminder.sh` remplacé par `stop-check.sh` (exécution réelle au lieu d'un rappel, décision 8). Pas de `deny Read(./.env.local)` : placeholders de dev (décision 4).

## 2026-11-08: lint de config

- Ajouté : `scripts/lint-agent-config.ts`, `pnpm agents:check` (aussi dans `pnpm check`), étape « Check agent config » du job CI `static-tests`. `AGENTS.md` cite les deux commandes.
- Plan : pas d'entrée `knip.json`, knip détecte le script via `package.json`. Le skill citait `scripts/lint-claude-config.sh` ; le plan (TypeScript, comme le reste du repo) prime.
