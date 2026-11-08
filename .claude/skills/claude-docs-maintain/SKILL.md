---
name: claude-docs-maintain
description: Entretien périodique de la configuration Claude Code d'un repo déjà restructuré — détecte la dérive entre CLAUDE.md/docs et le code, élague les instructions inutiles, promeut en hook les règles violées, propose skills et sous-agents pour les procédures répétées. Utiliser après un changement de stack, chaque mois, ou quand Claude répète les mêmes erreurs.
---

# Maintenance de la configuration Claude Code

Lis `docs/agents/checklist-2026.md`. Ce skill suppose un `CLAUDE.md` déjà structuré ;
sinon lance `claude-config-audit`.

Produis `docs/agents/maintenance-<AAAA-MM-JJ>.md` **et** applique directement les
corrections sûres (voir « Autonomie »).

## 0. Nom du fichier racine

Si le fichier racine s'appelle encore `CLAUDE.md` et que `claude --version` ≥ 2.1.277,
propose le renommage en `AGENTS.md` (critère A1b). Si `CLAUDE.md` et `AGENTS.md` coexistent,
signale-le en premier : `AGENTS.md` est ignoré.

## 1. Dérive commandes et stack

- Compare chaque commande citée dans `CLAUDE.md`, ses imports, `.claude/rules/**`, les
  skills et `docs/**` avec les manifestes et la CI. Signale celles disparues ou aux flags
  changés.
- Compare les versions figées avec les manifestes.
- Vérifie chaque import `@` et lien interne.

## 2. Dérive architecture

- `git log --since="<date du dernier rapport ou 60 days ago>" --name-only --format=''` →
  dossiers apparus/disparus. La carte des dossiers de `CLAUDE.md` et `docs/architecture.md`
  doit les refléter.
- Décisions structurantes récentes sans ADR : propose un ADR court pour chacune ; n'écris que
  ce qui est visible dans le code.

## 3. Charge par session

Recalcule `CLAUDE.md` + imports + rules sans `paths:`. Si > 200 lignes au total, propose ce
qui part en lien à la demande, en rule avec `paths:`, ou en skill.

## 4. Élagage et promotion

Pour chaque instruction de `CLAUDE.md` et des rules :

- **Inutile ?** Claude la respecterait sans elle → candidate au retrait.
- **Violée ?** Preuve dans l'historique récent (commits, PR) → si impérative, promouvoir en
  hook ou check CI et réduire à une ligne.
- **Vague ?** Reformuler en instruction vérifiable avec exemple.
- **Mal placée ?** Ne concerne qu'un sous-dossier → `.claude/rules/` avec `paths:` ou
  `CLAUDE.md` du sous-dossier.
- **Mal écrite (B6) ?** Pas de verbe impératif en tête, modalisateur, deux règles dans une
  phrase, interdit sans raison → réécrire selon la procédure de `claude-config-restructure`
  étape 1b, en vérifiant que la version réécrite garde chaque commande, chemin, nombre, exemple
  et raison. Une ligne vague qui ne peut pas devenir vérifiable n'est pas raccourcie : elle est
  remplacée par un exemple du repo ou proposée au retrait.
- **Ajoutée via `#` en session ?** Les instructions récentes et courtes sont souvent des
  réactions ponctuelles : vérifier qu'elles méritent de rester.

Toute instruction retirée est consignée dans `docs/agents/CHANGELOG.md` avec sa raison.

## 5. Procédures répétées → skills et sous-agents

- Dans l'historique récent, motifs ≥ 2 occurrences (mêmes fichiers touchés ensemble, mêmes
  messages : « add migration », « bump deps », « release ») sans skill existant → propose un
  skill (`name`, `description` « Fait X. Utiliser quand Y. », étapes). Crée-le seulement si
  la procédure est entièrement reconstituable depuis le code/CI.
- Tâches de revue ou d'exploration répétées sans sous-agent → propose `.claude/agents/<nom>.md`
  (tools restreints, model adapté).

## 6. Santé des skills, agents, hooks

- Chaque `SKILL.md` et `.claude/agents/*.md` : frontmatter valide, `name` = dossier/fichier,
  description dit quand l'utiliser, corps < 500 lignes, commandes/chemins existants, pas de
  README parasite.
- `.claude/settings.json` : parsable ; chaque script de hook existe et est exécutable ;
  chaque hook est testé avec un JSON d'exemple sur stdin.
- `.claude/commands/` ne doit plus exister (migré en skills).

## 7. Lint

- `wc -l CLAUDE.md` ≤ 150. Lance `scripts/lint-claude-config.sh` s'il existe ; sinon
  propose de le créer (cf. `claude-config-restructure`, étape 7).

## Autonomie

Applique **sans demander** : correction de commandes/versions/imports/liens, réécriture B6
d'une ligne quand la version réécrite contient encore toutes ses informations (sinon c'est une
proposition), mise à jour de la carte des dossiers, réparation d'un hook cassé
sans en changer le comportement.

**Demande avant** : retirer une instruction, créer ou modifier un hook ou une permission,
créer un skill, un sous-agent ou un ADR, déplacer une règle. Regroupe ces demandes en une
seule question à cases à cocher en fin de rapport.

## Rapport

```markdown
# Maintenance config Claude Code — <date>

> Lis ce fichier quand tu veux savoir ce qui a changé dans la config et pourquoi.

## Appliqué automatiquement

## Proposé (en attente de validation)

### Instructions à retirer

### Règles à promouvoir en hook

### Skills / sous-agents à créer

### ADR à écrire

### Règles à déplacer

## Indicateurs

| | Avant | Après |
| Lignes CLAUDE.md | | |
| Lignes chargées par session | | |
| Instructions impératives | | |
| Imports/liens cassés | | 0 |
| Modalisateurs (grep B6) | | 0 |
| Lignes sans verbe impératif (hors commandes/titres) | | |
| Skills + agents valides / total | | |
```

Conclus en 3 lignes : corrigé, en attente, prochaine échéance suggérée.
