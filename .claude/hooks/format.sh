#!/usr/bin/env bash
# PostToolUse Edit|Write: format the edited file, then lint-fix TypeScript.
file=$(jq -r '.tool_input.file_path // empty')
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
[[ -z "$file" || ! -f "$file" || "$file" != "$root"/* || "$file" == */node_modules/* ]] && exit 0
cd "$root" || exit 0
pnpm exec oxfmt "$file" >/dev/null 2>&1
if [[ "$file" =~ \.(ts|tsx)$ ]]; then
  pnpm exec oxlint --fix "$file" >/dev/null 2>&1
fi
exit 0
