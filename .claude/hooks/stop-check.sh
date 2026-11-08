#!/usr/bin/env bash
# Stop: run lint and format check when the working tree has changes.
input=$(cat)
[[ $(jq -r '.stop_hook_active // false' <<<"$input") == "true" ]] && exit 0
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0
[[ -z $(git status --porcelain --untracked-files=normal -- .) ]] && exit 0
if ! lint=$(pnpm lint 2>&1); then
  echo "pnpm lint failed, fix before finishing:" >&2
  echo "$lint" | tail -30 >&2
  exit 2
fi
if ! fmt=$(pnpm format:check 2>&1); then
  echo "pnpm format:check failed, run pnpm format:" >&2
  echo "$fmt" | tail -30 >&2
  exit 2
fi
exit 0
