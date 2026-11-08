---
name: upgrade-dependencies
description: Met à jour les dépendances pnpm du projet (toutes ou une lib précise), adapte le code aux breaking changes, puis lance pnpm check et pnpm test. Utiliser quand on demande d'upgrader les dépendances, de bumper une lib, ou de traiter un pnpm outdated.
---

# Upgrade des dépendances

`pnpm-workspace.yaml` impose `minimumReleaseAge: 4320` (3 jours) : pnpm refuse une version publiée depuis moins longtemps. Ne contourne pas ce réglage.

## Étapes

1. Lance `pnpm outdated` et note les mises à jour majeures à part des mineures et patchs.
2. Lance `pnpm update` pour les mises à jour compatibles avec les ranges de `package.json`.
3. Pour chaque majeure, lance `pnpm add <pkg>@latest` (`-D` pour une devDependency), une lib à la fois :
   - lis son changelog ou son guide de migration avant d'adapter le code ;
   - garde le préfixe `~` des libs épinglées en mineure (`react-router`, `better-auth`) : monte leur mineure dans un commit dédié `chore: upgrade <lib> <version>`.
4. Lance `pnpm exec prisma generate` si `prisma` ou `@prisma/*` a bougé.
5. Lance `pnpm check`. Corrige jusqu'au vert.
6. Lance `pnpm test` (Docker démarré). Corrige jusqu'au vert.
7. Lance `pnpm test:e2e` si `react-router`, `better-auth`, `@playwright/test`, `fastify` ou une lib de formulaire a changé de mineure ou de majeure.
8. Mets à jour `AGENTS.md` (ligne Stack) et la doc thématique concernée si une version citée change.
9. Commite `package.json` et `pnpm-lock.yaml` avec `chore: upgrade dependencies`, et chaque adaptation de code liée à une majeure dans un commit séparé.

## Rapport

Liste les libs montées en majeure, les adaptations faites, et toute lib laissée en arrière avec sa raison (release trop récente, breaking change à traiter à part).
