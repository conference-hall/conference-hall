import type { ReactNode } from 'react';

/**
 * Splits `text` around every case-insensitive occurrence of `query`, wrapping the
 * matched fragments in an indigo span. Uses `indexOf` (not RegExp) so regex-unsafe
 * queries such as `c++` or `(` are handled safely. Returns the text untouched when
 * there is no match.
 */
export function highlightMatch(text: string, query: string): ReactNode[] {
  const trimmed = query.trim();
  if (!trimmed) return [text];

  const haystack = text.toLowerCase();
  const needle = trimmed.toLowerCase();

  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  let index = haystack.indexOf(needle, cursor);

  while (index !== -1) {
    if (index > cursor) nodes.push(text.slice(cursor, index));
    nodes.push(
      <span key={key++} className="text-indigo-600">
        {text.slice(index, index + needle.length)}
      </span>,
    );
    cursor = index + needle.length;
    index = haystack.indexOf(needle, cursor);
  }

  if (cursor < text.length) nodes.push(text.slice(cursor));
  return nodes;
}
