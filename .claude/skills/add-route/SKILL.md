---
name: add-route
description: Ajoute une page ou une action React Router (entrée dans app/routes.ts, module avec middleware, loader et action, service, clés i18n en et fr, types générés, test). Utiliser quand une tâche crée une nouvelle page, un nouvel endpoint de formulaire ou une route d'API.
---

# Ajout d'une route

Les conventions détaillées sont dans `docs/routes.md`, `docs/authorization.md`, `docs/services.md` et `docs/i18n.md`, chargés automatiquement quand tu touches les fichiers concernés. Pour une route d'API publique, lis aussi `docs/api.md`.

## Étapes

1. Choisis le slice `app/features/<area>/` et nomme le module en kebab-case avec les termes de `docs/GLOSSARY.md`.
2. Déclare la route dans `app/routes.ts` au bon niveau d'imbrication, avec un `id` si elle est ciblée par `useRouteLoaderData` ou `href()`.
3. Lance `pnpm tsc` pour générer `./+types/<module>.ts`.
4. Écris le module dans l'ordre `meta`, `middleware`, `loader`, `action`, `handle`, composant, `ErrorBoundary` :
   - `middleware` : la chaîne minimale (`requireAuth`, `requireAuthorizedTeam`, `requireAuthorizedEvent`) ;
   - `loader` / `action` : lis le contexte, valide avec `parseWithZod` et l'intent pattern, appelle un service ; aucun accès `db` dans le module.
5. Mets la logique dans un service `services/<nom>.server.ts` (`Class.for(context)`, check `permissions.canXxx`) et son schéma Zod dans `services/<nom>.schema.server.ts`.
6. Ajoute chaque texte visible dans `app/locales/en.translation.json` et `app/locales/fr.translation.json`, puis lance `pnpm i18n:check`.
7. Écris les tests :
   - `services/<nom>.server.test.ts` pour le service, avec les factories de `tests/factories/` ;
   - `*.test.tsx` pour un composant à logique ;
   - un spec Playwright et sa page object pour un parcours utilisateur nouveau (délégable au sous-agent `e2e-writer`).
8. Lance `pnpm test:unit run <fichier>` sur chaque test écrit, puis `pnpm check`.
