# Plan de migration : configuration Claude Code

**Exécuté le 2026-11-08** sur `chore/setup-agents` (commits `01ac081f` à `652812c8`, puis journal). Écarts et retraits : `docs/agents/CHANGELOG.md`.

Généré le 2026-11-08 par claude-config-audit. Lis ce fichier quand tu exécutes `claude-config-restructure`.

## Résumé

- État : `CLAUDE.md` court (46 lignes, ~30 instructions, 0 import `@`) et 14 docs thématiques de bonne qualité dans `docs/`, mais aucune config `.claude/` versionnée (`.gitignore:31` ignore tout `.claude`), ni hook, ni permission, ni sous-agent.
- Charge par session : 103 lignes, ~1 240 tokens (`CLAUDE.md` 46 + `~/.claude/CLAUDE.md` 40 + `MEMORY.md` 17), dont ~8 rarement utiles.
- Problème 1 : les `paths:` des docs (`docs/routes.md:3` etc.) ne déclenchent rien, Claude Code ne lit ce frontmatter que dans `.claude/rules/`. Le chargement repose sur la consigne `CLAUDE.md:30`.
- Problème 2 : aucune règle « doit » n'est déterministe (pas de `.claude/settings.json`, `lefthook.yml` est optionnel d'après `README.md`).
- Problème 3 : dérive doc/code (`docs/testing.md:12` contredit `CLAUDE.md:11`, `docs/i18n.md` ignore x18n introduit en #870, `docs/routes.md:9` dit React Router v7 pour `react-router ~8.5.1`). Effort estimé : **M**.

À chaque session Claude charge 103 lignes, dont 8 rarement utiles (`CLAUDE.md:16` comptes de test, `:26` alias lisibles dans `tsconfig.json`, `:45` env de test, `:46` cache Vite, et 4 lignes de `MEMORY.md` sur des chantiers clos).

## Score par section

| Section                    | MUST ok/total | SHOULD ok/total | Points bloquants                                           |
| -------------------------- | ------------- | --------------- | ---------------------------------------------------------- |
| A. Fichiers d'instructions | 1/2           | 0/2             | A2 : `CLAUDE.local.md` non ignoré                          |
| B. Taille et densité       | 2/2           | 1/4             | aucun                                                      |
| C. Structure (non notée)   | n/a           | 5/9 sections    | Git, Vérification, Workflow Claude, Interdits absents      |
| D. Chargement progressif   | 1/1           | 1/2             | aucun                                                      |
| E. Skills                  | 2/2           | 1/2             | skills non versionnés (`.gitignore:31`)                    |
| F. Hooks et permissions    | 0/1           | 0/3             | F1 : aucun hook, aucun `settings.json` projet              |
| G. Sous-agents             | n/a           | 0/2             | aucun                                                      |
| H. Docs orientées agent    | 0/1           | 1/3             | H1 : `docs/architecture.md`, `docs/conventions.md` absents |
| I. Hygiène                 | 0/1 (⚠️)      | 0/2             | I1 : dérive après #870 et 3199abef                         |

## Constats

### A1 ✅ / A1b ⚠️ Nom du fichier racine

Preuve : `claude --version` → `2.1.319` (≥ 2.1.277) ; seul `./CLAUDE.md` existe (`find . -name CLAUDE.md`) ; aucun `CLAUDE.md` dans `~/`, `~/dev/`, `~/dev/oss/` ; aucun `AGENTS.md`, `.cursorrules`, `GEMINI.md`, `copilot-instructions.md`.
Correctif : `git mv CLAUDE.md AGENTS.md` (aucun import `@` à résoudre). Conditions restantes : confirmer que personne n'utilise Bedrock/Vertex/Foundry (voir Décisions). `~/.claude/CLAUDE.md` reste la mémoire utilisateur, non concernée.

### A2 ❌ Fichiers personnels non ignorés correctement

Preuve : `git check-ignore -v CLAUDE.local.md` ne renvoie rien ; `.claude/settings.local.json` n'est ignoré que via la ligne globale `.gitignore:31` (`.claude`), qui empêche aussi de versionner skills, rules, agents et `settings.json`.
Correctif dans `.gitignore`, section `# ai` : remplacer `.claude` par `.claude/settings.local.json`, `.claude/worktrees/` et ajouter `CLAUDE.local.md`.

### A3 n/a

Aucune zone ne justifie un fichier imbriqué : les docs thématiques couvrent les zones via `paths:` (voir D2).

### B3 ⚠️ Instructions redondantes avec le code

Preuve : `CLAUDE.md:26` (alias `~/*`, `tests/*`) est lisible dans `tsconfig.json` ; `CLAUDE.md:16` recopie `README.md` (comptes de test) ; `CLAUDE.md:45` (`tests/.env.test`) est découvert dès la lecture de `vitest.config.ts`.
Correctif : garder `:26` uniquement pour « Imports keep the `.ts`/`.tsx` extension » (non déductible), retirer `:45`, garder `:16` (utile au login scripté, voir mémoire `dev-server-scripted-login`).

### B4 ⚠️ Doublons et contradictions

- `docs/testing.md:12`, `:30`, `:42` : `pnpm test run "<file path>"` (relance le push du schéma) contre `CLAUDE.md:11` : `pnpm test:unit run <file>`. Correctif : aligner `docs/testing.md` sur `pnpm test:unit run "<file path>"`.
- `CLAUDE.md:23` recopie `docs/services.md:9-15` et `:51-57` ; `CLAUDE.md:15` recopie `docs/database.md:40-42` ; `CLAUDE.md:44` recopie `docs/testing.md:21-23`. Correctif : une ligne de carte dans `AGENTS.md`, le détail reste dans la doc (rendue auto-chargée par D2).
- `docs/routes.md:9` titre « React Router v7 » alors que `package.json` déclare `react-router ~8.5.1` ; `README.md` (section Stack) cite « React router v7 » et « Express » alors que le serveur est Fastify (`servers/web.ts`). Correctif : corriger les deux.

### B5 ✅

Commandes et architecture en tête, formulation positive majoritaire.

### B6 ⚠️ Style

Chiffres sur `CLAUDE.md` : **6** lignes d'instruction sans verbe impératif en tête (`:3`, `:7`, `:30`, `:43`, `:45`, `:46`), **0** modalisateur (2 dans `docs/database.md` : « when useful » `:21`, « sensible defaults » `:14`), **2** interdits sans raison (`:23` « (no repositories) », `:44` « not raw Prisma calls »).
Réécritures :

- `CLAUDE.md:7` « Docker (`docker compose up`) must be running for tests, e2e and the dev server (Postgres, Redis, S3 via Garage, Mailpit). » → « Start Docker (`docker compose up`) before `pnpm test`, `pnpm test:e2e` or `pnpm dev`: they need Postgres, Redis, S3 via Garage and Mailpit. »
- `CLAUDE.md:46` « Browser tests failing outside the diff with `Invalid hook call` or `useState` on null: stale Vite deps cache, run `rm -rf node_modules/.vite`. » → « Run `rm -rf node_modules/.vite` when browser tests fail outside the diff with `Invalid hook call` or `useState` on null: the Vite deps cache is stale. »
  Interdits à compléter par leur raison (à fournir par l'humain, voir Décisions) : `:23` pourquoi pas de repositories, `:44` pourquoi pas de Prisma brut.

### C ⚠️ Structure de `CLAUDE.md`

Présentes : C1 (`:3`, sans versions), C2 (`:5-16`, sans `pnpm install` ni `pnpm lint`/`pnpm format` isolés), C3 (`:18-26`), C4 (partiel via `:28-39`), C9 (`:28-39`).
Absentes : C5 Workflow Git (le contenu existe dans `docs/contributing.md:11-15`), C6 Vérification (seule trace : `:14` « Run it before handing work off »), C7 Workflow Claude Code, C8 Interdits (le seul, `:16`, est noyé dans Commandes).
Correctif : brouillon complet plus bas.

### D2 ❌ Docs à `paths:` jamais chargées automatiquement

Preuve : 14 fichiers `docs/*.md` portent `paths:` (`docs/routes.md:3`, `docs/services.md:3`, …), mais `.claude/rules/` n'existe pas. Claude Code ignore ce frontmatter ailleurs.
Correctif : `.claude/rules/<sujet>.md` en lien symbolique vers `docs/<sujet>.md` (une seule source, le frontmatter `paths:` existant devient actif). En plus : `docs/emails.md:5` `app/features/**/emails/**` ne correspond à aucun fichier suivi (`git ls-files`), à corriger ou supprimer ; `docs/logging.md:4` `'**/*.ts'` charge 91 lignes dès qu'un `.ts` est lu, à restreindre à `servers/**` et `app/**/*.server.ts` si l'humain valide.

### D3 ✅

0 import `@` dans `CLAUDE.md`.

### E1 ✅ E2 ✅ E3 ✅ / E4 ⚠️

Preuve : 3 skills (`claude-config-audit` 115 lignes, `claude-config-restructure` 151, `claude-docs-maintain` 120) ont `name` = dossier et une `description` « Fait X. Utiliser quand Y. ». Pas de `.claude/commands/`.
E4 : procédures répétées sans skill (voir Candidats). Les 3 skills existants ne sont pas versionnés (A2).

### F1 ❌ Règles impératives sans hook

| Règle                                                    | Source                              | Hook ou check existant                            |
| -------------------------------------------------------- | ----------------------------------- | ------------------------------------------------- |
| `pnpm check` avant de rendre le travail                  | `CLAUDE.md:14`                      | CI `static-tests` seulement, rien en session      |
| `pnpm tsc` après ajout de route                          | `CLAUDE.md:13`, `docs/routes.md:16` | CI seulement                                      |
| `pnpm exec prisma generate` après `prisma/schema.prisma` | `CLAUDE.md:15`                      | aucun                                             |
| Demander avant `pnpm db:reset`                           | `CLAUDE.md:16`                      | aucun (`settings.json` absent)                    |
| « After creating test, ALWAYS execute »                  | `docs/testing.md:31`, `:43`, `:60`  | aucun                                             |
| Clés `en` et `fr` triées                                 | `docs/i18n.md:16-17`                | CI `pnpm i18n:check` (x18n `write.sort`)          |
| Format et lint                                           | `lefthook.yml`                      | pre-commit optionnel (`README.md` : « optional ») |
| Correctif : `.claude/settings.json` (étape 6).           |

### F2 ❌ F3 ❌

Preuve : `.claude/settings.json` absent ; seul `~/.claude/settings.json` existe (hook `SessionStart` personnel).
Correctif : hooks `PostToolUse` format, `PreToolUse` garde Bash, `Stop` rappel de vérification ; `permissions.allow/ask/deny` versionnées (étape 6).

### F4 ❌ Secrets lisibles

Preuve : `git ls-files` liste `.env.local` (17 variables dont `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_SECRET`, `GITHUB_CLIENT_SECRET`) et `tests/.env.test`. Aucune règle `deny`.
Correctif : `deny: ["Read(./.env.local)"]` si les valeurs ne sont pas de purs placeholders locaux (voir Décisions). `tests/.env.test` reste lisible (`CLAUDE.md:45` y renvoie).

### F5 n/a

`SessionStart` existe au niveau utilisateur ; rien à ajouter côté projet.

### G1 ❌ G2 ❌

Preuve : `.claude/agents/` absent. Rôles répétés observés : revue de PR selon `docs/*.md`, écriture de tests e2e avec page objects (`e2e/tests/event-management/proposal.test.ts` modifié 10 fois sur 200 commits).
Correctif : 2 sous-agents (étape 8) et une ligne chacun en section 7 d'`AGENTS.md`.

### H1 ❌ Docs minimales

Preuve : `docs/testing.md` ✅ ; `docs/architecture.md` et `docs/conventions.md` absents.
Correctif : créer `docs/architecture.md` (contenu de `CLAUDE.md:18-26` développé : processus web/jobs, OTel, frontière `services/` ↔ routes, `app/shared` vs `app/features`) et `docs/conventions.md` (index des docs thématiques, nommage via `docs/GLOSSARY.md`, extensions d'import, kebab-case des fichiers de service, `docs/services.md:134`).

### H2 ❌ Pas d'ADR

Correctif : `docs/adr/` avec 3 décisions déjà prises dans l'historique : `0001-services-without-repositories.md` (`CLAUDE.md:23`), `0002-node-redis-client.md` (#824), `0003-garage-local-s3.md` (#827).

### H3 ⚠️

Preuve : les 14 docs ont un `description:` en frontmatter, aucune ne commence par une ligne « Lis ce fichier quand ».
Correctif : ajouter après le frontmatter `> Read this file when: <tâche>` (langue à trancher, voir Décisions).

### H4 ✅

Docs orientées intention ; les blocs de code de `docs/services.md` sont des exemples, pas des copies de signatures.

### I1 ⚠️ Mise à jour non systématique

Preuve : `4f2cc03d feat: setup x18n (#870)` n'a touché ni `CLAUDE.md` ni `docs/i18n.md` (`git show --stat`), qui ne mentionne pas `pnpm i18n:check` ni le tri par x18n. `3199abef` a bien mis à jour `CLAUDE.md`.
Correctif : ajouter `pnpm i18n:check` dans `docs/i18n.md` ; règle I1 en section 7 d'`AGENTS.md`.

### I2 ⚠️ / I3 ❌

Preuve : skill `claude-docs-maintain` présent mais non versionné ; aucun lint de config en CI (`.github/workflows/ci.yml`).
Correctif : script `scripts/lint-agent-config.ts` lancé par une étape du job `static-tests` (étape 9).

### Hors checklist

- `docs/*.md` contient 108 em-dashes (ex. `docs/testing.md:12`, `docs/GLOSSARY.md` 36) alors que la convention de l'utilisateur les interdit. Les lignes réécrites pendant la migration doivent les retirer.
- `.claude/skills/claude-config-audit/SKILL.md` impose un titre avec em-dash ; ce plan utilise un deux-points à la place.

## Candidats à extraction

### Skills

| Nom                    | Description                                                                                                                                                                                                      | Preuve                                                           |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `upgrade-dependencies` | Met à jour les dépendances pnpm, régénère Prisma et lance `pnpm check` puis `pnpm test`. Utiliser quand on demande d'upgrader les dépendances ou une lib précise.                                                | 50 commits « upgrade » sur 200 ; `package.json` modifié 65 fois  |
| `db-migration`         | Modifie `prisma/schema.prisma`, crée la migration `pnpm db:migrate:dev --name=...`, régénère le client, met à jour `tests/factories/` et `prisma/seed.ts`. Utiliser quand une tâche change le modèle de données. | `prisma/schema.prisma` 24 commits, `prisma/seed.ts` 12           |
| `add-route`            | Ajoute une route : entrée dans `app/routes.ts`, module avec middleware/loader/action, clés `en`+`fr`, `pnpm tsc`, test. Utiliser quand une tâche crée une page ou une action.                                    | `app/locales/{en,fr}.translation.json` modifiés ensemble 38 fois |

### Sous-agents

| Nom          | tools                                                | model  | Rôle                                                                    |
| ------------ | ---------------------------------------------------- | ------ | ----------------------------------------------------------------------- |
| `reviewer`   | Read, Grep, Glob, Bash(git diff:_), Bash(git log:_)  | sonnet | Relit un diff contre `docs/*.md` et `docs/GLOSSARY.md`, ne modifie rien |
| `e2e-writer` | Read, Grep, Glob, Edit, Write, Bash(pnpm test:e2e:*) | sonnet | Écrit specs Playwright et page objects selon `docs/testing.md:47-70`    |

### Rules (`.claude/rules/`, liens symboliques vers `docs/`)

`api`, `authentication`, `authorization`, `components`, `database`, `emails`, `flags`, `i18n`, `jobs`, `logging`, `redis`, `routes`, `services`, `storage`, `testing`, `tracing` : frontmatter `paths:` déjà présent. `docs/GLOSSARY.md`, `docs/contributing.md`, `docs/privacy.md`, `docs/terms.md`, `docs/code-of-conduct.md` restent hors rules.

### Hooks

| Événement     | Matcher       | Commande                                                                                                                                                                                                     |
| ------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `PostToolUse` | `Edit\|Write` | `.claude/hooks/format.sh` : `pnpm exec oxfmt "$file"` puis `pnpm exec oxlint --fix "$file"` pour `*.ts(x)`                                                                                                   |
| `PostToolUse` | `Edit\|Write` | `.claude/hooks/prisma-generate.sh` : `pnpm exec prisma generate` si le fichier est `prisma/schema.prisma`                                                                                                    |
| `PreToolUse`  | `Bash`        | `.claude/hooks/guard-bash.sh` : exit 2 sur `git push --force`, `git push * main`, `git push * production`, `prisma migrate reset`                                                                            |
| `Stop`        | (aucun)       | `.claude/hooks/verify-reminder.sh` : si `git diff --name-only` contient du `.ts(x)` modifié depuis le dernier `pnpm check`, renvoie le rappel `pnpm check` + `pnpm test:unit run <fichiers de test touchés>` |

### Docs

| Fichier cible          | Ligne d'entrée                                                                           | Chargement                            |
| ---------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| `docs/architecture.md` | « Read this file when: you add a process, a feature folder, or cross a layer boundary. » | lien                                  |
| `docs/conventions.md`  | « Read this file when: you name a file, class, route or translation key. »               | lien                                  |
| `docs/GLOSSARY.md`     | « Read this file when: you name a domain concept in code, tests or issues. »             | lien (249 lignes, trop long pour `@`) |
| `docs/adr/*.md`        | « Read this file when: you question why X is done this way. »                            | lien                                  |

## Arborescence cible

```
AGENTS.md                         (ex-CLAUDE.md, ≤ 150 lignes)
.gitignore                        (.claude/settings.local.json, .claude/worktrees/, CLAUDE.local.md)
.claude/
├── settings.json                 (permissions + hooks)
├── hooks/
│   ├── format.sh
│   ├── prisma-generate.sh
│   ├── guard-bash.sh
│   └── verify-reminder.sh
├── rules/                        (liens symboliques → ../../docs/<sujet>.md)
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
├── architecture.md               (nouveau)
├── conventions.md                (nouveau)
├── adr/
│   ├── 0001-services-without-repositories.md
│   ├── 0002-node-redis-client.md
│   └── 0003-garage-local-s3.md
├── agents/
│   ├── checklist-2026.md
│   ├── MIGRATION-PLAN.md
│   └── CHANGELOG.md              (nouveau)
├── GLOSSARY.md
├── api.md authentication.md authorization.md components.md database.md emails.md
├── flags.md i18n.md jobs.md logging.md redis.md routes.md services.md storage.md
├── testing.md tracing.md         (+ ligne « Read this file when: »)
└── contributing.md code-of-conduct.md privacy.md terms.md sponsors/
scripts/
└── lint-agent-config.ts          (nouveau)
```

## Étapes ordonnées

1. **Versionner `.claude/`**
   Fichiers : `.gitignore`. Commandes : remplacer la ligne `.claude` par `.claude/settings.local.json`, `.claude/worktrees/`, `CLAUDE.local.md` ; `git add .claude/skills`.
   Vérification : `git check-ignore .claude/settings.json` sort en code 1 ; `git check-ignore CLAUDE.local.md` sort en code 0.
   Commit : `chore: version claude code config`

2. **Renommer et réécrire le fichier racine**
   Fichiers : `CLAUDE.md` → `AGENTS.md`. Commandes : `git mv CLAUDE.md AGENTS.md`, puis remplacer le contenu par le brouillon ci-dessous.
   Vérification : `wc -l AGENTS.md` ≤ 150 ; nouvelle session, `/memory` liste `AGENTS.md` ; `grep -c '—' AGENTS.md` = 0.
   Commit : `chore: rename CLAUDE.md to AGENTS.md and restructure it`

3. **Activer les docs thématiques comme rules**
   Fichiers : `.claude/rules/*.md` (16 liens), `docs/emails.md`, `docs/logging.md`. Commandes : `mkdir -p .claude/rules && for f in api authentication authorization components database emails flags i18n jobs logging redis routes services storage testing tracing; do ln -s ../../docs/$f.md .claude/rules/$f.md; done` ; corriger `docs/emails.md:5`.
   Vérification : `ls -lL .claude/rules` sans lien cassé ; en session, lire `app/features/event-management/schedule/services/schedule.server.ts` puis `/memory` montre `services.md` et `database.md` chargés.
   Commit : `chore: load topic docs as path-scoped rules`

4. **Corriger la dérive des docs**
   Fichiers : `docs/testing.md` (`:12`, `:30`, `:42` → `pnpm test:unit run "<file path>"`), `docs/i18n.md` (ajouter `pnpm i18n:check` et le tri x18n), `docs/routes.md:9` (v8), `docs/database.md:14`, `:21` (modalisateurs), `README.md` section Stack (Fastify, React Router v8), les 16 docs thématiques (ligne `> Read this file when:`).
   Vérification : `grep -n 'pnpm test run' docs/` vide ; `grep -ciE 'when useful|sensible' docs/database.md` = 0 ; `grep -L 'Read this file when' docs/{api,authentication,authorization,components,database,emails,flags,i18n,jobs,logging,redis,routes,services,storage,testing,tracing}.md` vide.
   Commit : `doc: fix drift between topic docs and code`

5. **Créer architecture, conventions et ADR**
   Fichiers : `docs/architecture.md`, `docs/conventions.md`, `docs/adr/0001-services-without-repositories.md`, `docs/adr/0002-node-redis-client.md`, `docs/adr/0003-garage-local-s3.md`.
   Vérification : chaque ADR 20 à 40 lignes avec Contexte / Décision / Conséquences ; liens depuis `AGENTS.md` valides.
   Commit : `doc: add architecture, conventions and ADRs`

6. **Permissions et hooks**
   Fichiers : `.claude/settings.json`, `.claude/hooks/{format,prisma-generate,guard-bash,verify-reminder}.sh` (`chmod +x`). Contenu de `permissions` :
   `allow`: `Bash(pnpm test:unit:*)`, `Bash(pnpm test:e2e:*)`, `Bash(pnpm test:db)`, `Bash(pnpm test)`, `Bash(pnpm check)`, `Bash(pnpm tsc)`, `Bash(pnpm lint:*)`, `Bash(pnpm format:*)`, `Bash(pnpm knip)`, `Bash(pnpm i18n:check)`, `Bash(pnpm exec prisma generate)`, `Bash(git status)`, `Bash(git diff:*)`, `Bash(git log:*)` ;
   `ask`: `Bash(pnpm db:reset:*)`, `Bash(pnpm db:migrate:deploy:*)`, `Bash(git push:*)` ;
   `deny`: `Read(./.env.local)` (selon Décisions).
   Vérification : `jq . .claude/settings.json` ; écrire un `.ts` mal formaté en session → reformaté ; `git push --force` → bloqué avec le message du hook.
   Commit : `chore: add claude code permissions and hooks`

7. **Skills métier**
   Fichiers : `.claude/skills/upgrade-dependencies/SKILL.md`, `.claude/skills/db-migration/SKILL.md`, `.claude/skills/add-route/SKILL.md`.
   Vérification : frontmatter `name` = dossier ; `description` ≤ 1 024 caractères avec « Utiliser quand » ; corps < 500 lignes.
   Commit : `chore: add upgrade-dependencies, db-migration and add-route skills`

8. **Sous-agents**
   Fichiers : `.claude/agents/reviewer.md`, `.claude/agents/e2e-writer.md`.
   Vérification : `/agents` les liste ; `reviewer` n'a ni Edit ni Write.
   Commit : `chore: add reviewer and e2e-writer subagents`

9. **Lint de config en CI**
   Fichiers : `scripts/lint-agent-config.ts`, `package.json` (script `agents:check`), `.github/workflows/ci.yml` (étape dans `static-tests`), `knip.json` (entrée du script).
   Contrôles : `AGENTS.md` présent et ≤ 150 lignes, aucun `CLAUDE.md` à la racine, liens Markdown internes valides dans `AGENTS.md` et `docs/*.md`, liens `.claude/rules/*` non cassés, frontmatter `name`/`description` des skills et agents.
   Vérification : `pnpm agents:check` vert ; casser un lien → rouge.
   Commit : `chore: lint claude code config in CI`

10. **Journal**
    Fichiers : `docs/agents/CHANGELOG.md` (instructions retirées de `CLAUDE.md` et pourquoi : `:26` alias, `:45` env, doublons B4).
    Commit : `doc: log agent instruction changes`

## Contenu proposé pour CLAUDE.md

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
- Create test data with `tests/factories/` (traits + attributes), never raw Prisma calls: <raison à fournir>.
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
- Never add a repository layer over Prisma: <raison à fournir, voir docs/adr/0001-services-without-repositories.md>.
- Never push to `main` or `production` directly: changes go through PRs and CI.

## More

- [docs/architecture.md](docs/architecture.md), [docs/conventions.md](docs/conventions.md), [docs/GLOSSARY.md](docs/GLOSSARY.md), [docs/adr/](docs/adr/)
- Topic docs (auto-loaded as rules): `docs/{api,authentication,authorization,components,database,emails,flags,i18n,jobs,logging,redis,routes,services,storage,testing,tracing}.md`
```

## Décisions à prendre par l'humain

1. **Renommer en `AGENTS.md` ?** Claude Code constaté : `2.1.319` (≥ 2.1.277), aucun `CLAUDE.md` parent, 0 import `@`. Seule inconnue : un contributeur utilise-t-il Bedrock, Vertex ou Foundry ? Si oui, garder `CLAUDE.md`.
2. **Versionner `.claude/` ?** `.gitignore:31` l'ignore entièrement, peut-être volontairement (skills personnels). Sans ce changement, les étapes 3, 6, 7, 8 restent locales à ta machine.
3. **Rules en liens symboliques ou copies ?** Les liens gardent `docs/` comme source unique ; une copie dans `.claude/rules/` créerait une dérive. Confirmer que les contributeurs Windows ne sont pas concernés.
4. **`.env.local` :** les secrets suivis par Git sont-ils des placeholders de dev ? Si non, les retirer de l'historique ; si oui, `deny Read(./.env.local)` reste-t-il utile ?
5. **Raisons manquantes :** pourquoi pas de repositories (`CLAUDE.md:23`) et pourquoi pas de Prisma brut dans les tests (`CLAUDE.md:44`) ? Elles alimentent `AGENTS.md` et l'ADR 0001.
6. **Langue de la ligne d'entrée des docs :** `> Read this file when:` (cohérent avec docs en anglais) ou `> Lis ce fichier quand :` (texte de la checklist) ?
7. **`docs/logging.md` :** restreindre `paths: '**/*.ts'` à `servers/**` et `app/**/*.server.ts` ?
8. **Hook `Stop` :** simple rappel, ou exécution réelle de `pnpm lint` + `pnpm format:check` (quelques secondes à chaque fin de tour) ?
9. **Modèle des sous-agents :** `sonnet` pour `reviewer` et `e2e-writer`, ou `opus` pour `reviewer` ? Le plugin `mattpocock-skills:code-review` couvre déjà une revue : garder `reviewer` en plus ?
10. **Em-dashes :** retirer les 108 em-dashes de `docs/*.md` pendant la migration (ta convention globale) ou seulement sur les lignes réécrites ?

## Réponses de l'humain (2026-11-08)

1. Renommer en `AGENTS.md` : oui, personne n'utilise Bedrock, Vertex ou Foundry.
2. Versionner `.claude/` : oui.
3. Rules : liens symboliques vers `docs/`.
4. `.env.local` : placeholders de dev, pas de `deny`.
5. Raisons : pas de repository car Prisma est déjà l'abstraction (un repository dupliquerait son API typée sans gain) ; factories car elles fournissent des défauts valides et des traits (un changement de schéma se corrige à un seul endroit) et gardent le test centré sur les attributs qui comptent.
6. Ligne d'entrée des docs : `> Read this file when:`.
7. `docs/logging.md` : restreindre à `servers/**` et `app/**/*.server.ts`.
8. Hook `Stop` : exécuter réellement `pnpm lint` + `pnpm format:check`.
9. Sous-agents : `e2e-writer` seul, en `sonnet` ; pas de `reviewer` (couvert par `mattpocock-skills:code-review`).
10. Em-dashes : tous les retirer de `docs/*.md`.

Branche : `chore/setup-agents` (branche courante).
