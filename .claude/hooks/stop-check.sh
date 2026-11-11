#!/usr/bin/env bash
# Stop: when the working tree has changes, fix format and lint (Bash edits skip the PostToolUse hook), then fail on remaining lint errors.
input=$(cat)
[[ $(jq -r '.stop_hook_active // false' <<<"$input") == "true" ]] && exit 0
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0
[[ -z $(git status --porcelain --untracked-files=normal -- .) ]] && exit 0
lint=$(pnpm lint --fix 2>&1)
lint_status=$?
pnpm format >/dev/null 2>&1
if ((lint_status != 0)); then
  echo "pnpm lint failed, fix before finishing:" >&2
  echo "$lint" | tail -30 >&2
  exit 2
fi
exit 0
