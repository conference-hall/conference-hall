#!/usr/bin/env bash
# PostToolUse Edit|Write: regenerate the Prisma client after a schema change.
file=$(jq -r '.tool_input.file_path // empty')
[[ "$file" != */prisma/schema.prisma ]] && exit 0
cd "${CLAUDE_PROJECT_DIR:-$(pwd)}" || exit 0
if ! out=$(pnpm exec prisma generate 2>&1); then
  echo "prisma generate failed:" >&2
  echo "$out" | tail -20 >&2
  exit 2
fi
exit 0
