# Checklist — configuration Claude Code (état de l'art, novembre 2026)

Source de vérité partagée par les skills `claude-config-audit`, `claude-config-restructure`
et `claude-docs-maintain`. Chaque critère est formulé pour être vérifiable par un agent.

Légende : **[MUST]** bloquant · **[SHOULD]** recommandé · **[MAY]** optionnel.

Convention : ci-dessous, « `CLAUDE.md` » désigne le fichier d'instructions racine, qu'il
s'appelle `CLAUDE.md` ou `AGENTS.md` (voir A1b).

---

## A. Fichiers d'instructions

- **A1 [MUST]** Un seul fichier d'instructions racine, source de vérité unique. Aucun autre
  (`.cursorrules`, `GEMINI.md`, `copilot-instructions.md`) ne porte de contenu dupliqué ;
  s'ils existent sans usage, les supprimer.
- **A1b [SHOULD]** Ce fichier s'appelle `AGENTS.md`, pas `CLAUDE.md`. Claude Code ≥ 2.1.277
  (sept. 2026) lit `AGENTS.md` nativement quand aucun `CLAUDE.md` n'existe dans le dossier ni
  dans un parent. Le nom neutre évite un futur renommage et le contenu reste identique.
  Conditions : `claude --version` ≥ 2.1.277, aucun `CLAUDE.md` résiduel dans un parent
  (`~/` compris, hors `~/.claude/CLAUDE.md` qui reste la mémoire utilisateur), et
  vérification après renommage que les imports `@` sont bien résolus ; sinon les convertir en
  liens Markdown. Si la version est plus ancienne ou si l'équipe est sur Bedrock/Vertex/Foundry
  (support non encore disponible à cette date), garder `CLAUDE.md`.
- **A2 [MUST]** `CLAUDE.local.md` (overrides personnels) et `.claude/settings.local.json`
  dans `.gitignore`.
- **A3 [SHOULD]** Fichier d'instructions de sous-dossier (`apps/web/AGENTS.md`, même nom
  que le racine) pour ce qui ne concerne qu'une zone : chargé seulement quand Claude y
  travaille, jamais de répétition du racine. Ne jamais mélanger les deux noms dans un même
  repo : un `CLAUDE.md` imbriqué ferait ignorer `AGENTS.md` dans tout son sous-arbre.
- **A4 [MAY]** `~/.claude/CLAUDE.md` pour les préférences personnelles transverses (style de
  réponse, langue) ; rien de projet n'y vit.

## B. Taille et densité du fichier racine

- **B1 [MUST]** `CLAUDE.md` ≤ 150 lignes et ≤ ~100 instructions impératives. Au-delà,
  l'adhérence chute : ce qui est rarement utile part dans des fichiers chargés à la demande.
- **B2 [MUST]** Chaque instruction est spécifique et vérifiable. Interdit : « écris du code
  propre », « suis les bonnes pratiques ». Attendu : « `pnpm test --filter <pkg>` avant tout
  commit », « jamais `any` sans commentaire `// why:` ».
- **B3 [SHOULD]** Supprimer toute instruction que Claude respecte déjà sans elle (tester en
  la retirant).
- **B4 [SHOULD]** Pas de duplication avec ce qui est lisible ailleurs (README, package.json,
  schéma) : pointer vers le fichier, ne pas recopier.
- **B5 [SHOULD]** Instructions les plus importantes en tête ; formulation positive (« fais X »)
  sauf interdits réels.
- **B6 [SHOULD]** Style d'écriture des instructions (fichier racine, rules, corps des skills) :
  - une instruction par ligne, verbe à l'impératif en tête (« Lance », « Utilise », « Ne commite jamais ») ;
  - aucun modalisateur (« si possible », « généralement », « il serait préférable », « essaie de ») :
    soit c'est une règle, soit ça n'est pas écrit ;
  - voix active, pas de politesse, pas de phrase d'introduction (« Ce projet attache de
    l'importance à… ») ;
  - la raison reste, en une proposition courte après deux-points ou un tiret
    (« jamais `any` — casse l'inférence en aval ») ;
  - commandes, chemins, noms exacts conservés tels quels ; un exemple do/don't vaut mieux qu'un
    adjectif.
  - **Garde-fous** : simplifier n'autorise jamais à (a) remplacer un détail concret par un terme
    générique (« lance les tests » à la place de la commande), (b) supprimer la raison d'une
    règle, (c) fusionner deux règles en une phrase, (d) retirer un exemple. Si la version
    courte perd une de ces informations, la version longue reste.
  - Test de la ligne : elle commence par un verbe impératif, ou c'est une commande, un chemin, un
    titre, un tableau ou une raison rattachée à la ligne précédente. Sinon, réécrire ou déplacer
    en doc.
- **B7 [MAY]** Docs chargées à la demande (`docs/**`, ADR, `references/` des skills) : ton
  explicatif autorisé, mais conclusion d'abord puis justification, paragraphes ≤ 5 lignes,
  un titre par idée pour que Claude puisse sauter ce qui ne le concerne pas.

## C. Structure attendue de `CLAUDE.md`

Sections dans cet ordre (omettre celles vides) :

1. **Projet en une phrase** + stack (versions figées).
2. **Commandes** : install, dev, build, test (unitaire / e2e / un seul fichier), lint,
   typecheck, format. Exactes, copiables.
3. **Architecture** : carte des dossiers (5–15 lignes), points d'entrée, frontières à ne pas
   franchir.
4. **Conventions** : nommage, structure d'un module type, erreurs, logs, i18n si pertinent.
5. **Workflow Git** : branches, format de commit, contenu attendu d'une PR, ce qu'il ne faut
   jamais commiter.
6. **Vérification** : comment Claude prouve que le travail est fini (tests à lancer, captures,
   checks CI). Section la plus rentable.
7. **Workflow Claude Code** : plan mode pour les tâches > N fichiers, `/clear` entre tâches,
   commit par étape, quand solliciter quel sous-agent ou skill.
8. **Interdits** : liste courte, chaque ligne avec la raison.
9. **Où aller chercher plus** : `@docs/architecture.md`, rules, skills.

## D. Chargement progressif (progressive disclosure)

- **D1 [MUST]** Les détails longs (guide de style complet, ADR, procédures de release,
  schémas) vivent dans `docs/` ou dans des skills ; `CLAUDE.md` y renvoie par `@chemin`
  (import inline) ou par lien Markdown selon qu'on veut le charger toujours ou à la demande.
- **D2 [SHOULD]** `.claude/rules/<sujet>.md` avec frontmatter `paths: ["src/api/**"]` pour les
  règles par zone de fichiers : chargées seulement quand Claude touche ces fichiers. Sans
  `paths`, un fichier de `rules/` est chargé à chaque session : réserver aux règles vraiment
  globales que l'on veut sortir de `CLAUDE.md` par thème.
- **D3 [SHOULD]** Imports `@` : au plus 3–5 dans `CLAUDE.md`, uniquement pour ce qui est
  utile à chaque session. Le reste en lien Markdown (Claude lit le fichier quand il en a besoin).
- **D4 [MAY]** Profondeur d'import ≤ 2 (un fichier importé qui importe lui-même).

## E. Skills (`.claude/skills/<nom>/SKILL.md`)

- **E1 [MUST]** Frontmatter YAML `name` (kebab-case = nom du dossier) + `description`.
- **E2 [MUST]** `description` dit _ce que fait_ le skill **et quand l'utiliser** : seul texte lu
  avant déclenchement (~1 024 caractères max).
- **E3 [SHOULD]** Corps < 500 lignes / ~5 000 tokens ; détail dans `references/`, `scripts/`,
  `assets/` à un niveau de profondeur.
- **E4 [SHOULD]** Candidats : toute procédure répétée > 2 fois (release, migration DB, ajout
  d'un endpoint, revue selon la grille maison). Les anciens `.claude/commands/*.md` sont
  migrés en skills (même invocation `/nom`, plus de capacités).
- **E5 [MAY]** Pas de `README.md`/`CHANGELOG.md` dans un skill ; les scripts prennent des
  arguments plutôt que d'être édités.

## F. Déterminisme : hooks et permissions plutôt que prose

- **F1 [MUST]** Toute règle qui _doit_ être respectée (formatage, interdiction de push sur
  `main`, secrets, exécution des tests) est un hook ou un check CI, pas une phrase dans
  `CLAUDE.md`. Fichier : `.claude/settings.json` → `hooks` (`PreToolUse`, `PostToolUse`,
  `Stop`, `SessionStart`, `UserPromptSubmit`…).
- **F2 [SHOULD]** `PostToolUse` (Edit|Write) → formateur ; `PreToolUse` (Bash) → bloque
  `git push --force`, `rm -rf` hors du repo, commandes destructives du projet ; `Stop` →
  rappel ou exécution des tests si des fichiers ont été modifiés.
- **F3 [SHOULD]** `permissions.allow` / `deny` versionnées dans `.claude/settings.json`
  (ex. `allow: ["Bash(pnpm test*)"]`, `deny: ["Read(.env*)"]`) ; le personnel dans
  `settings.local.json`.
- **F4 [SHOULD]** Secrets et gros fichiers exclus de la lecture (`.claudeignore` ou `deny`).
- **F5 [MAY]** `SessionStart` qui affiche l'état du repo (branche, tests rouges, TODO) pour
  éviter que Claude le redécouvre à chaque session.

## G. Sous-agents (`.claude/agents/<nom>.md`)

- **G1 [SHOULD]** Un sous-agent par rôle répété : `reviewer`, `test-writer`, `migrator`,
  `explorer`. Frontmatter `name`, `description` (quand l'invoquer), `tools` (restreints),
  `model` (haiku/sonnet pour les tâches mécaniques).
- **G2 [SHOULD]** Dans `CLAUDE.md` section 7, une ligne par sous-agent : quand le solliciter.
- **G3 [MAY]** Mémoire persistante (`memory: project`) seulement pour les agents qui en tirent
  un bénéfice vérifié (ex. reviewer qui apprend les faux positifs).

## H. Documentation projet orientée agent

- **H1 [MUST]** `docs/` contient au minimum `architecture.md` (décisions structurantes, pas
  un tutoriel), `conventions.md` (le guide complet que `CLAUDE.md` résume), `testing.md`
  (stratégie, test type, fixtures).
- **H2 [SHOULD]** Décisions d'architecture en ADR courts (`docs/adr/NNNN-titre.md`, 20–40
  lignes : Contexte / Décision / Conséquences).
- **H3 [SHOULD]** Chaque doc commence par `> Lis ce fichier quand : …`.
- **H4 [SHOULD]** Aucune doc ne recopie le code (signatures, listes de fichiers) : décrire
  l'intention, pointer vers le code.
- **H5 [MAY]** `docs/agents/` : plan de migration, `CHANGELOG.md` des instructions
  retirées/ajoutées et pourquoi, rapports de maintenance.

## I. Hygiène et maintenance

- **I1 [MUST]** `CLAUDE.md` mis à jour dans le même commit que tout changement de commande,
  stack ou convention.
- **I2 [SHOULD]** Revue mensuelle ou trimestrielle : retirer les instructions non
  déclenchées, promouvoir en hook celles violées, convertir en skill les procédures répétées.
- **I3 [SHOULD]** Lint minimal en CI : fichier présent, ≤ 150 lignes, pas de secret, imports
  `@` et liens internes valides, frontmatter des skills et agents valide.
- **I4 [MAY]** Utiliser `#` en session pour ajouter une instruction à `CLAUDE.md`, puis la
  relire au prochain commit : ce qui entre vite doit être élagué vite.

---

## Anti-patterns à signaler systématiquement

| Symptôme                                            | Problème                                      | Correctif                                   |
| --------------------------------------------------- | --------------------------------------------- | ------------------------------------------- |
| `CLAUDE.md` > 200 lignes                            | Règles noyées, adhérence faible               | Découper (D1, D2), élaguer (B3)             |
| 10 imports `@` en tête                              | Tout chargé à chaque session, contexte saturé | Garder 3–5, le reste en lien (D3)           |
| « Toujours lancer les tests » en prose, jamais fait | Pas déterministe                              | Hook `Stop`/`PreToolUse` (F1)               |
| Liste de tous les fichiers du projet                | Se périme à chaque PR                         | Carte des dossiers (H4)                     |
| Instructions de style vagues                        | Non vérifiables                               | Exemples do/don't concrets (B2)             |
| Skill de 1 200 lignes                               | Jamais lu en entier                           | Corps court + `references/` (E3)            |
| `description` de skill = son nom                    | Jamais déclenché                              | « Fait X. Utiliser quand Y. » (E2)          |
| `.claude/commands/` et `.claude/skills/` coexistent | Doublon de mécanismes                         | Migrer en skills (E4)                       |
| `.cursorrules` ou `GEMINI.md` orphelins             | Dérive silencieuse                            | Supprimer (A1)                              |
| `CLAUDE.md` et `AGENTS.md` coexistent               | `AGENTS.md` ignoré, dérive garantie           | Un seul nom, `AGENTS.md` (A1b)              |
| « Il serait préférable de… », « si possible »       | Règle lue comme suggestion                    | Impératif ou suppression (B6)               |
| Règle raccourcie en « fais des tests »              | Précision perdue, non actionnable             | Rétablir la commande exacte (B6 garde-fous) |
| Interdit sans raison                                | Ne se généralise pas aux cas non listés       | Ajouter la raison en une proposition (B6)   |
