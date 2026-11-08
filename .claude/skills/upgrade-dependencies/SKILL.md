---
name: upgrade-dependencies
description: Upgrades the project's pnpm dependencies (all of them or a single library), adapts the code to breaking changes, then runs pnpm check and pnpm test. Use when asked to upgrade dependencies, bump a library, or act on pnpm outdated.
---

# Dependency upgrade

`pnpm-workspace.yaml` sets `minimumReleaseAge: 4320` (3 days): pnpm refuses a version published more recently. Do not bypass this setting.

## Steps

1. Run `pnpm outdated` and list major upgrades separately from minors and patches.
2. Run `pnpm update` for upgrades compatible with the ranges in `package.json`.
3. For each major, run `pnpm add <pkg>@latest` (`-D` for a devDependency), one library at a time:
   - read its changelog or migration guide before adapting the code;
   - keep the `~` prefix of libraries pinned to a minor (`react-router`, `better-auth`): bump their minor in a dedicated commit `chore: upgrade <lib> <version>`.
4. Run `pnpm exec prisma generate` if `prisma` or `@prisma/*` moved.
5. Run `pnpm check`. Fix until green.
6. Run `pnpm test` (Docker running). Fix until green.
7. Run `pnpm test:e2e` if `react-router`, `better-auth`, `@playwright/test`, `fastify` or a form library changed minor or major.
8. Update `AGENTS.md` (Stack line) and the matching topic doc if a cited version changes.
9. Commit `package.json` and `pnpm-lock.yaml` as `chore: upgrade dependencies`, and each code adaptation for a major in a separate commit.

## Report

List the libraries bumped to a new major, the adaptations made, and every library left behind with its reason (release too recent, breaking change to handle separately).
