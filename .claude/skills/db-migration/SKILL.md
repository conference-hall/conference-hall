---
name: db-migration
description: Modifie le modèle de données Prisma de bout en bout (schema.prisma, migration, client, factories de test, seed) puis vérifie avec les tests. Utiliser quand une tâche ajoute, renomme ou supprime un modèle, un champ, une relation, un index ou un enum.
---

# Migration de base de données

Les conventions de schéma (CUID, `@@map` en snake_case, `createdAt`/`updatedAt`, relations, index) sont dans `docs/database.md`, chargé automatiquement sur `prisma/**`.

## Étapes

1. Démarre Docker (`docker compose up`) si Postgres n'est pas déjà lancé.
2. Modifie `prisma/schema.prisma`. Le hook `prisma-generate.sh` régénère le client à chaque édition.
3. Crée la migration : `pnpm db:migrate:dev --name="<snake_case_description>"`, une seule par changement (ex. `add_submission_passes`).
4. Ouvre le `migration.sql` généré dans `prisma/migrations/<timestamp>_<name>/` :
   - vérifie qu'aucune colonne `NOT NULL` n'est ajoutée sans défaut sur une table existante ;
   - ajoute le backfill SQL nécessaire quand une donnée existante doit être transformée.
5. Mets à jour la factory du modèle dans `tests/factories/` (nouveau champ requis, trait si l'état est courant).
6. Mets à jour `prisma/seed.ts` si le champ est requis ou utile pour la démo locale.
7. Adapte les services et leurs schémas Zod (`*.schema.server.ts`) qui lisent ou écrivent le modèle.
8. Lance `pnpm test:db` pour pousser le schéma vers la DB de test.
9. Lance `pnpm test:unit run <fichier>` sur chaque test des services touchés, puis `pnpm check`.
10. Commite le schéma, la migration, les factories et le seed ensemble.

## Interdits

- Ne lance jamais `pnpm db:reset` sans accord : il efface la DB de dev locale.
- N'édite jamais une migration déjà sur `main` : crée une nouvelle migration.
