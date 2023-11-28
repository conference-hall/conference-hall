import type { ChangeEvent } from 'react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

export const useListSelection = (ids: Array<string>, total: number) => {
  const ref = useRef<HTMLInputElement>(null);
  const [selection, setSelected] = useState<Array<string>>([]);

  const toggleAll = useCallback(() => {
    const newIds = ids.filter((val) => !selection.includes(val));
    if (newIds.length > 0) {
      setSelected([...selection, ...newIds]);
    } else {
      setSelected(selection.filter((val) => !ids.includes(val)));
    }
  }, [selection, ids]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.disabled = total === 0;
    ref.current.checked = total !== 0 && selection.length === total;
    ref.current.indeterminate = selection.length > 0 && selection.length < total;
    ref.current.onchange = toggleAll;
  }, [selection, ids, toggleAll, total]);

  const reset = useCallback(() => setSelected([]), []);

  const toggle = useCallback(
    (id: string) => (event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) return setSelected([...selection, id]);
      return setSelected(selection.filter((val) => val !== id));
    },
    [selection],
  );

  const isSelected = useCallback((id: string) => selection.includes(id), [selection]);

  return useMemo(
    () => ({
      ref,
      selection,
      reset,
      isSelected,
      toggle,
    }),
    [ref, selection, reset, isSelected, toggle],
  );
};
