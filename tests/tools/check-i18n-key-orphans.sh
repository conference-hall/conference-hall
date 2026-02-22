#!/bin/bash
# check-i18n-key-orphans.sh
#
# Usage: ./check-i18n-key-orphans.sh [-p] <locales-dir> <src-dir>
#   -p    Show partial matches (dynamic key usage)
# Example: ./check-i18n-key-orphans.sh -p ./public/locales/en ./src

SHOW_PARTIALS=false

while getopts "p" opt; do
  case $opt in
    p) SHOW_PARTIALS=true ;;
    *) echo "Usage: $0 [-p] <locales-dir> <src-dir>"; exit 1 ;;
  esac
done
shift $((OPTIND - 1))

LOCALES_DIR="${1:?Usage: $0 [-p] <locales-dir> <src-dir>}"
SRC_DIR="${2:?Usage: $0 [-p] <locales-dir> <src-dir>}"

if [[ ! -d "$LOCALES_DIR" ]]; then
  echo "Error: Directory not found: $LOCALES_DIR"
  exit 1
fi

SRC_CACHE=$(mktemp)
trap "rm -f $SRC_CACHE" EXIT

find "$SRC_DIR" -type f \( -name '*.ts' -o -name '*.tsx' -o -name '*.js' -o -name '*.jsx' -o -name '*.hbs' -o -name '*.vue' \) \
  -exec cat {} + > "$SRC_CACHE"

echo "=== Source cached: $(wc -l < "$SRC_CACHE") lines ==="
echo ""

PLURAL_SUFFIXES="_zero _one _two _few _many _other"

orphan_count=0
partial_count=0

search_exact() {
  local key="$1"
  grep -q -e "\"$key\"" -e "'$key'" -e "\`$key\`" "$SRC_CACHE"
}

search_partial() {
  local key="$1"

  IFS='.' read -ra segments <<< "$key"
  local total=${#segments[@]}

  for (( i = total - 1; i >= 1; i-- )); do
    local prefix=""
    for (( j = 0; j < i; j++ )); do
      [[ -n "$prefix" ]] && prefix="$prefix."
      prefix="$prefix${segments[$j]}"
    done

    if grep -q \
      -e "\`$prefix.\${" \
      -e "\"$prefix.\" +" -e "'$prefix.' +" \
      "$SRC_CACHE"; then
      echo "$prefix"
      return 0
    fi
  done

  return 1
}

search_plural() {
  local key="$1"

  for suffix in $PLURAL_SUFFIXES; do
    if [[ "$key" == *"$suffix" ]]; then
      local base_key="${key%$suffix}"
      if search_exact "$base_key"; then
        return 0
      fi
    fi
  done

  return 1
}

for json_file in "$LOCALES_DIR"/*.json; do
  [[ ! -f "$json_file" ]] && continue

  filename=$(basename "$json_file")
  echo "=== $filename ==="

  keys=$(jq -r 'keys[]' "$json_file")

  for key in $keys; do
    if search_exact "$key"; then
      continue
    fi

    if search_plural "$key"; then
      continue
    fi

    matched_prefix=$(search_partial "$key")
    if [[ $? -eq 0 ]]; then
      ((partial_count++))
      if [[ "$SHOW_PARTIALS" == true ]]; then
        echo "  ⚡ PARTIAL: $key  (prefix \"$matched_prefix\" used dynamically)"
      fi
    else
      echo "  ⚠  ORPHAN:  $key"
      ((orphan_count++))
    fi
  done

  echo ""
done

echo "================================"
echo "  Orphan keys:  $orphan_count"
echo "  Dynamic keys: $partial_count"
echo "================================"

if [[ $orphan_count -gt 0 ]]; then
  exit 1
fi
