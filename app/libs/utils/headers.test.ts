import { combineHeaders } from './headers.ts';

describe('combineHeaders', () => {
  it('combines multiple headers without overriding existing ones', () => {
    const headers1 = { 'Content-Type': 'application/json' };
    const headers2 = { Authorization: 'Bearer token' };
    const combined = combineHeaders(headers1, headers2);

    expect(combined.get('Content-Type')).toBe('application/json');
    expect(combined.get('Authorization')).toBe('Bearer token');
  });

  it('appends duplicate headers instead of overriding them', () => {
    const headers1 = { 'Set-Cookie': 'cookie1=value1' };
    const headers2 = { 'Set-Cookie': 'cookie2=value2' };
    const combined = combineHeaders(headers1, headers2);

    expect(combined.get('Set-Cookie')).toEqual('cookie1=value1, cookie2=value2');
  });

  it('handles null or undefined headers gracefully', () => {
    const headers1 = { 'Content-Type': 'application/json' };
    const combined = combineHeaders(headers1, null, undefined);

    expect(combined.get('Content-Type')).toBe('application/json');
  });

  it('returns an empty Headers object when no headers are provided', () => {
    const combined = combineHeaders();

    expect([...combined.entries()]).toEqual([]);
  });

  it('combines headers from Headers instances and plain objects', () => {
    const headers1 = new Headers({ 'X-Custom-Header': 'value1' });
    const headers2 = { 'X-Custom-Header': 'value2' };
    const combined = combineHeaders(headers1, headers2);

    expect(combined.get('X-Custom-Header')).toEqual('value1, value2');
  });
});
