import { renderHook } from 'vitest-browser-react';
import { useStableValue } from './use-stable-value.ts';

describe('useStableValue', () => {
  it('keeps the first reference when the value is rebuilt with the same content', async () => {
    const { result, rerender } = await renderHook((value: Array<{ id: string }> = []) => useStableValue(value), {
      initialProps: [{ id: 'a' }],
    });
    const first = result.current;

    await rerender([{ id: 'a' }]);

    expect(result.current).toBe(first);
  });

  it('returns the new reference when the content changes', async () => {
    const { result, rerender } = await renderHook((value: Array<{ id: string }> = []) => useStableValue(value), {
      initialProps: [{ id: 'a' }],
    });
    const first = result.current;

    await rerender([{ id: 'b' }]);

    expect(result.current).not.toBe(first);
    expect(result.current).toEqual([{ id: 'b' }]);
  });
});
