import { isValidElement, type ReactElement, type ReactNode } from 'react';
import { highlightMatch } from './highlight-match.tsx';

// Extract the text wrapped in highlight spans.
function highlightedParts(nodes: ReactNode[]): string[] {
  return nodes
    .filter((node): node is ReactElement<{ children: string }> => isValidElement(node))
    .map((node) => node.props.children);
}

// Reconstruct the full rendered string (plain fragments + highlighted fragments).
function plainText(nodes: ReactNode[]): string {
  return nodes
    .map((node) => (isValidElement<{ children: string }>(node) ? node.props.children : String(node)))
    .join('');
}

describe('highlightMatch', () => {
  it('returns the text untouched when there is no match', () => {
    const nodes = highlightMatch('React Native', 'angular');
    expect(nodes).toEqual(['React Native']);
    expect(highlightedParts(nodes)).toEqual([]);
  });

  it('returns the text untouched for an empty query', () => {
    expect(highlightMatch('React Native', '')).toEqual(['React Native']);
    expect(highlightMatch('React Native', '   ')).toEqual(['React Native']);
  });

  it('highlights a single occurrence', () => {
    const nodes = highlightMatch('React Native', 'Native');
    expect(highlightedParts(nodes)).toEqual(['Native']);
    expect(plainText(nodes)).toBe('React Native');
  });

  it('highlights all occurrences', () => {
    const nodes = highlightMatch('test a test b test', 'test');
    expect(highlightedParts(nodes)).toEqual(['test', 'test', 'test']);
    expect(plainText(nodes)).toBe('test a test b test');
  });

  it('matches case-insensitively while preserving original casing', () => {
    const nodes = highlightMatch('React and REACT', 'react');
    expect(highlightedParts(nodes)).toEqual(['React', 'REACT']);
    expect(plainText(nodes)).toBe('React and REACT');
  });

  it('handles regex-unsafe queries without error', () => {
    const plus = highlightMatch('Learning c++ today', 'c++');
    expect(highlightedParts(plus)).toEqual(['c++']);
    expect(plainText(plus)).toBe('Learning c++ today');

    const paren = highlightMatch('A (parenthesis) here', '(');
    expect(highlightedParts(paren)).toEqual(['(']);
    expect(plainText(paren)).toBe('A (parenthesis) here');
  });
});
