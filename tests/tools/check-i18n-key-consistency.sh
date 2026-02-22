#!/bin/bash
# check-i18n-key-consistency.sh
#
# Checks that all language files for the same namespace have identical keys.
# File naming convention: <lang>.<namespace>.json
#
# Usage: ./check-i18n-key-consistency.sh <locales-dir>
# Example: ./check-i18n-key-consistency.sh ./public/locales

LOCALES_DIR="${1:?Usage: $0 <locales-dir>}"

if [[ ! -d "$LOCALES_DIR" ]]; then
  echo "Error: Directory not found: $LOCALES_DIR"
  exit 1
fi

error_count=0

# Collect unique namespaces
namespaces=$(
  for json_file in "$LOCALES_DIR"/*.json; do
    [[ ! -f "$json_file" ]] && continue
    filename=$(basename "$json_file" .json)
    echo "${filename#*.}"
  done | sort -u
)

for namespace in $namespaces; do
  echo "=== Namespace: $namespace ==="

  files=()
  langs=()
  for json_file in "$LOCALES_DIR"/*."$namespace".json; do
    [[ ! -f "$json_file" ]] && continue
    files+=("$json_file")
    filename=$(basename "$json_file" .json)
    langs+=("${filename%%.*}")
  done

  if [[ ${#files[@]} -lt 2 ]]; then
    echo "  ⚠  Only one language file found, skipping."
    echo ""
    continue
  fi

  ref_file="${files[0]}"
  ref_lang="${langs[0]}"
  ref_keys=$(jq -r 'keys[]' "$ref_file" | sort)

  for (( i = 1; i < ${#files[@]}; i++ )); do
    cmp_file="${files[$i]}"
    cmp_lang="${langs[$i]}"
    cmp_keys=$(jq -r 'keys[]' "$cmp_file" | sort)

    missing_in_cmp=$(comm -23 <(echo "$ref_keys") <(echo "$cmp_keys"))
    extra_in_cmp=$(comm -13 <(echo "$ref_keys") <(echo "$cmp_keys"))

    if [[ -n "$missing_in_cmp" ]]; then
      count=$(echo "$missing_in_cmp" | wc -l)
      ((error_count += count))
      echo "  ⚠  $count key(s) in $ref_lang but missing in $cmp_lang:"
      while IFS= read -r key; do
        echo "      - $key"
      done <<< "$missing_in_cmp"
    fi

    if [[ -n "$extra_in_cmp" ]]; then
      count=$(echo "$extra_in_cmp" | wc -l)
      ((error_count += count))
      echo "  ⚠  $count key(s) in $cmp_lang but missing in $ref_lang:"
      while IFS= read -r key; do
        echo "      - $key"
      done <<< "$extra_in_cmp"
    fi

    if [[ -z "$missing_in_cmp" && -z "$extra_in_cmp" ]]; then
      echo "  ✅ $ref_lang ↔ $cmp_lang: all keys match"
    fi
  done

  echo ""
done

echo "================================"
echo "  Mismatched keys: $error_count"
echo "================================"

if [[ $error_count -gt 0 ]]; then
  exit 1
fi
