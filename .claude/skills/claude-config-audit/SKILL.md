---
name: claude-config-audit
description: Audite la configuration Claude Code d'un repo (CLAUDE.md, .claude/rules, skills, agents, commands, settings/hooks, docs/) contre la checklist 2026 et produit un plan de migration sans rien modifier. Utiliser avant toute refonte de CLAUDE.md, ou quand Claude semble ignorer les instructions du projet.
---

# Audit de la configuration Claude Code

Tu es en **lecture seule** : tu ne modifies aucun fichier du projet, tu produis un seul
livrable, `docs/agents/MIGRATION-PLAN.md`.

Lis d'abord `docs/agents/checklist-2026.md` intégralement. Chaque constat du rapport cite
l'identifiant du critère (ex. `B1`, `F1`).

## 1. Inventaire

Localise et lis, s'ils existent :

- Racine : `CLAUDE.md`, `CLAUDE.local.md`, `.claudeignore`, et tout fichier d'instructions
  d'un autre outil (`AGENTS.md`, `.cursorrules`, `GEMINI.md`, `.github/copilot-instructions.md`)
- `.claude/` : `settings.json`, `settings.local.json`, `rules/`, `skills/`, `agents/`,
  `commands/`
- `CLAUDE.md` imbriqués : `find . -name CLAUDE.md -not -path '*/node_modules/*'`
- Fichiers importés par `@` depuis `CLAUDE.md` (suis chaque import, profondeur 2)
- Docs : `README.md`, `CONTRIBUTING.md`, `docs/**`, ADR
- Contexte projet : manifestes (`package.json`, `pyproject.toml`, `Cargo.toml`, `go.mod`),
  CI, `Makefile`/`justfile`, scripts lint/format/test

Pour chaque fichier d'instructions, note : lignes, nombre d'instructions impératives (lignes
commençant par un verbe, « always/never/toujours/jamais », puces), imports `@`, et doublons
avec un autre fichier (comparaison paragraphe par paragraphe).

## 2. Nom du fichier racine

- `claude --version` (ou demande-la si indisponible). Si ≥ 2.1.277 et que le fichier racine
  s'appelle `CLAUDE.md` : note la recommandation A1b (renommer en `AGENTS.md`) et liste les
  conditions à vérifier (aucun `CLAUDE.md` dans un parent, imports `@` résolus après
  renommage, pas de Bedrock/Vertex/Foundry).
- Si `CLAUDE.md` et `AGENTS.md` coexistent : `AGENTS.md` est ignoré par Claude Code ; signale-le
  comme bloquant.

## 3. Ce qui est chargé à chaque session

Calcule la charge réelle : `CLAUDE.md` + imports `@` + `.claude/rules/*.md` sans `paths:` +
`~/.claude/CLAUDE.md` si lisible. Donne le total en lignes et en tokens approximatifs
(lignes × 12). Conclus en une phrase : « à chaque session Claude charge X lignes, dont Y
rarement utiles ».

## 4. Évaluation critère par critère

Parcours les sections A → I de la checklist. Pour chaque MUST et SHOULD : ✅ / ⚠️ / ❌ / —
avec une preuve d'une ligne (chemin:ligne ou commande exécutée).

Teste concrètement, ne suppose pas :

- Les commandes citées existent-elles ? (`grep` dans les manifestes ; n'exécute rien de
  destructif.)
- Les imports `@` et liens internes pointent-ils vers des fichiers existants ?
- Les `description` de skills et d'agents disent-elles _quand_ les utiliser ?
- Quelles règles « doit toujours » n'ont aucun hook ni check CI correspondant ?
- `settings.json` est-il valide (JSON parsable, matchers de hooks cohérents) ?
- Style (B6) : compte les lignes d'instruction qui ne commencent pas par un verbe impératif
  (hors commandes, chemins, titres, tableaux), les modalisateurs (`grep -ciE "si possible|généralement|préférable|essaie|idéalement|when possible|try to|ideally|generally"`),
  et les interdits sans raison. Donne les trois chiffres et deux exemples de lignes à réécrire,
  chacun avec sa version réécrite **qui conserve** commande, raison et exemple.

## 5. Candidats à extraction

À partir du contenu et de `git log --oneline -200` (messages récurrents, fichiers souvent
modifiés ensemble) :

- Procédures répétées et `.claude/commands/*.md` → candidats **skills** (nom + description
  « Fait X. Utiliser quand Y. »).
- Rôles répétés (revue, tests, migrations) → candidats **sous-agents** (nom, tools, model).
- Règles par zone de code → candidats **rules** avec glob `paths:`.
- Règles impératives → candidats **hooks** (événement + matcher + commande).
- Contenu long → candidats **docs/** (fichier cible + ligne « Lis ce fichier quand… »), avec
  pour chacun : import `@` (toujours chargé) ou lien (à la demande).

## 6. Livrable : `docs/agents/MIGRATION-PLAN.md`

Structure imposée :

```markdown
# Plan de migration — configuration Claude Code

Généré le <date> par claude-config-audit. Lis ce fichier quand tu exécutes `claude-config-restructure`.

## Résumé (5 lignes max)

État actuel, charge par session, 3 problèmes principaux, effort estimé (S/M/L).

## Score par section

| Section | MUST ok/total | SHOULD ok/total | Points bloquants |

## Constats

<un bloc par critère ❌/⚠️, avec preuve et correctif concret>

## Arborescence cible

<tree complet de CLAUDE.md, .claude/ et docs/ après migration>

## Étapes ordonnées

Chaque étape : titre, fichiers touchés, commandes, critère de vérification, message de commit.

## Contenu proposé pour CLAUDE.md

<brouillon complet ≤ 150 lignes, sections C1→C9, basé sur l'existant>

## Décisions à prendre par l'humain

<questions ouvertes : renommer en AGENTS.md (oui/non, avec la version Claude Code constatée),
garder/supprimer tel fichier, import vs lien, quel modèle pour tel agent…>
```

## 7. Fin

Termine par 3 lignes : chemin du plan, nombre de MUST non respectés, invitation à relire
« Décisions à prendre » avant de lancer `claude-config-restructure`.

Interdit : recommandations génériques. Chaque ligne du plan nomme un fichier de ce repo.
