#!/usr/bin/env bash
# PreToolUse Bash: block destructive git and database commands.
cmd=$(jq -r '.tool_input.command // empty')
block() { echo "Blocked by .claude/hooks/guard-bash.sh: $1" >&2; exit 2; }
start='(^|[;&|(][[:space:]]*)'
while IFS= read -r line; do
  if [[ "$line" =~ ${start}git[[:space:]]+push([[:space:]].*)?$ ]]; then
    push="${BASH_REMATCH[0]}"
    [[ "$push" =~ (--force|[[:space:]]-f([[:space:]]|$)|[[:space:]]\+[^[:space:]]) ]] && block "force push rewrites shared history."
    [[ "$push" =~ [[:space:]:](main|production)([[:space:]]|$) ]] && block "never push to main or production directly, open a PR."
  fi
  [[ "$line" =~ ${start}((npx|pnpm([[:space:]]+exec)?)[[:space:]]+)?prisma[[:space:]]+migrate[[:space:]]+reset ]] &&
    block "it wipes the database. Ask the user, then they run pnpm db:reset."
done <<<"$cmd"
exit 0
