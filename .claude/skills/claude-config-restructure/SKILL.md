---
name: claude-config-restructure
description: Exécute docs/agents/MIGRATION-PLAN.md pour restructurer la configuration Claude Code d'un repo — CLAUDE.md court et vérifiable, rules par périmètre, skills, hooks et permissions dans settings.json, sous-agents, docs/ orientée agent. Utiliser après claude-config-audit, ou directement pour initialiser la config d'un repo qui n'en a pas.
---

# Restructuration de la configuration Claude Code

Prérequis : `docs/agents/MIGRATION-PLAN.md` existe. Sinon, lance `claude-config-audit` puis
arrête-toi pour laisser l'humain relire le plan.

Lis `docs/agents/checklist-2026.md`. Tout ce que tu écris respecte les MUST ; signale chaque
SHOULD non respecté et pourquoi.

## Règles d'exécution

1. **Une étape du plan = un commit.** Message : celui du plan.
2. **Jamais de perte de contenu.** Chaque instruction existante est conservée, déplacée
   (docs/, rules/, skill, hook) ou supprimée _avec une justification_ dans
   `docs/agents/CHANGELOG.md` (« retiré : “X” — Claude le fait déjà sans instruction /
   doublon de Y / remplacé par le hook Z »).
3. **Ne tranche pas les « Décisions à prendre par l'humain ».** Si une étape en dépend sans
   réponse dans le plan, pose la question et attends.
4. **Vérifie chaque étape** avec son critère avant la suivante.
5. Branche `chore/claude-config` si le repo est propre ; sinon demande.

## Ordre de référence (adapter au plan)

### Étape 1 — Fichier d'instructions racine

- Si le plan a validé le renommage (A1b) : `git mv CLAUDE.md AGENTS.md`. Vérifier qu'aucun
  `CLAUDE.md` ne subsiste dans le repo ni dans un dossier parent, puis lancer une session et
  confirmer que les instructions sont chargées et que les imports `@` sont résolus ; s'ils ne
  le sont pas, les convertir en liens Markdown. Les `CLAUDE.md` de sous-dossiers prennent le
  même nom.
- Réécrire le fichier à partir du brouillon du plan. ≤ 150 lignes, sections C1→C9.
- Chaque commande citée est vérifiée dans les manifestes.
- Imports `@` : 3–5 maximum, seulement pour ce qui sert à chaque session. Le reste en lien
  Markdown.
- Supprimer les fichiers d'instructions d'autres outils devenus orphelins (`.cursorrules`,
  `GEMINI.md`…) si le plan le prévoit.
- `CLAUDE.local.md` et `.claude/settings.local.json` dans `.gitignore`.

### Étape 1b — Passe de réécriture (B6)

Applique-la à chaque fichier d'instructions écrit ou déplacé dans cette étape et les suivantes
(racine, sous-dossiers, rules, corps des skills), jamais aux commandes ni aux exemples de code.

Procédure, ligne par ligne :

1. Si la ligne est une commande, un chemin, un titre, un tableau ou une raison rattachée à la
   ligne précédente : ne touche à rien.
2. Sinon, réécris-la : verbe impératif en tête, une seule instruction, voix active, sans
   modalisateur ni politesse, raison conservée en une proposition courte.
3. Avant de valider la réécriture, vérifie que la nouvelle ligne contient encore **chaque**
   commande, chemin, nombre, nom et exemple de l'ancienne, et sa raison. Si un élément manque,
   reprends. Si la ligne contenait deux règles, produis deux lignes.
4. Une ligne qui n'exprime aucune règle vérifiable après réécriture (« le code doit être
   propre ») n'est pas raccourcie : elle est soit remplacée par un exemple do/don't tiré du
   repo, soit retirée avec justification dans le CHANGELOG.

Contrôle de la passe : `diff` avant/après ; pour chaque ligne supprimée ou modifiée, un
commentaire d'une ligne dans le CHANGELOG sous « Réécritures » (« “X” → “Y”, conservé :
commande, raison »). Les modalisateurs restants doivent être à zéro
(`grep -ciE "si possible|généralement|préférable|essaie|idéalement|when possible|try to|ideally"`).

### Étape 2 — Chargement progressif

- `.claude/rules/<sujet>.md` pour chaque candidat rule du plan, frontmatter :
  ```yaml
  ---
  paths:
    - 'src/api/**'
  ---
  ```
- `CLAUDE.md` de sous-dossiers pour les monorepos (section « Spécifique à ce package »,
  jamais de répétition du racine).

### Étape 3 — Docs orientée agent

- `docs/architecture.md`, `docs/conventions.md`, `docs/testing.md` : créer ou refondre.
  Première ligne : `> Lis ce fichier quand : …`.
- Style B7 : conclusion d'abord, justification ensuite, paragraphes ≤ 5 lignes, un titre par
  idée. Le ton explicatif est autorisé ici ; ne pas appliquer la passe B6 aux docs.
- Tout paragraphe > 10 lignes de l'ancien `CLAUDE.md` sur un même sujet migre ici ;
  `CLAUDE.md` garde résumé + lien ou import.
- `docs/adr/0001-…` pour chaque décision structurante déjà visible dans le code (Contexte /
  Décision / Conséquences, 20–40 lignes). N'invente rien.
- Aucune doc ne recopie signatures ou listes de fichiers.

### Étape 4 — Skills

- Migrer chaque `.claude/commands/<nom>.md` en `.claude/skills/<nom>/SKILL.md` (même
  invocation `/nom`), puis supprimer `commands/`.
- Pour chaque candidat skill du plan : frontmatter `name` (= dossier, kebab-case),
  `description` « Fait X. Utiliser quand Y. », corps < 500 lignes, étapes numérotées avec
  commandes exactes, `references/` pour le détail, `scripts/` pour ce qui s'exécute.
- Vérifier : `head -5` montre un frontmatter valide ; aucun README dans le dossier.

### Étape 5 — Hooks et permissions

- `.claude/settings.json` versionné. Modèle minimal à adapter :
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
            { "type": "command", "command": "jq -r '.tool_input.file_path' | xargs -r <formatter> 2>/dev/null || true" }
          ]
        }
      ],
      "PreToolUse": [{ "matcher": "Bash", "hooks": [{ "type": "command", "command": ".claude/hooks/guard-bash.sh" }] }]
    }
  }
  ```
  Les scripts de hooks vivent dans `.claude/hooks/` et sont exécutables. Tester chaque hook à
  la main (lancer la commande avec un JSON d'exemple sur stdin) avant de commiter.
- Retirer de `CLAUDE.md` toute phrase désormais garantie par un hook ; la remplacer par une
  mention d'une ligne (« formatage automatique via hook »).

### Étape 6 — Sous-agents

- `.claude/agents/<nom>.md` pour chaque rôle du plan. Frontmatter : `name`, `description`
  (quand l'invoquer), `tools` (liste restreinte), `model`. Corps : mission, entrées
  attendues, format de sortie, ce qu'il ne doit pas faire.
- Une ligne par sous-agent dans la section « Workflow Claude Code » de `CLAUDE.md`.

### Étape 7 — Lint et maintenance

- `scripts/lint-claude-config.sh` : `CLAUDE.md` présent et ≤ 150 lignes, pas de pattern de
  secret, imports `@` et liens internes valides, `settings.json` parsable, frontmatter de
  chaque `SKILL.md` et `.claude/agents/*.md` présent, zéro modalisateur dans le fichier racine
  et les rules (liste B6, en avertissement et non en erreur). Appelé en CI.
- `docs/agents/CHANGELOG.md` complété avec toutes les instructions retirées (règle 2).
- `docs/agents/MIGRATION-PLAN.md` marqué « exécuté le <date> ».

## Vérification finale

Exécute et rapporte :

```bash
wc -l AGENTS.md CLAUDE.md 2>/dev/null
grep -c '^@' AGENTS.md CLAUDE.md 2>/dev/null
find . -name CLAUDE.md -not -path '*/node_modules/*'   # vide si renommé
find .claude/skills -name SKILL.md -exec head -4 {} \;
find .claude/agents -name '*.md' -exec head -5 {} \; 2>/dev/null
jq . .claude/settings.json > /dev/null && echo settings-ok
scripts/lint-claude-config.sh
```

Puis, en ne lisant que `CLAUDE.md`, réponds à « commande pour lancer un seul test ? » et
« où ajouter un endpoint ? ». Si tu ne peux pas, corrige `CLAUDE.md`.

Conclus en 5 lignes : commits, fichiers supprimés, instructions retirées (nombre + renvoi
CHANGELOG), SHOULD non respectés et pourquoi.
