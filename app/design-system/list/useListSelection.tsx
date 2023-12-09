import type { ChangeEvent } from 'react';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';

export const useListSelection = (ids: Array<string>, total: number) => {
  const ref = useRef<HTMLInputElement>(null);
  const [selection, setSelection] = useState<Array<string>>([]);
  const [allPagesSelected, setAllPagesSelected] = useState(false);

  const toggle = useCallback(
    (id: string) => (event: ChangeEvent<HTMLInputElement>) => {
      setAllPagesSelected(false);
      if (event.target.checked) return setSelection([...selection, id]);
      return setSelection(selection.filter((val) => val !== id));
    },
    [selection],
  );

  const toggleAll = useCallback(() => {
    if (allPagesSelected) {
      setSelection([]);
      return setAllPagesSelected(false);
    }
    const newIds = ids.filter((val) => !selection.includes(val));
    if (newIds.length > 0) {
      setSelection([...selection, ...newIds]);
    } else {
      setSelection(selection.filter((val) => !ids.includes(val)));
    }
  }, [selection, ids, allPagesSelected]);

  const toggleAllPages = useCallback(() => {
    setSelection([]);
    setAllPagesSelected(!allPagesSelected);
  }, [allPagesSelected]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    ref.current.disabled = total === 0;
    ref.current.checked = (total !== 0 && selection.length === total) || allPagesSelected;
    ref.current.indeterminate = selection.length > 0 && selection.length < total;
    ref.current.onchange = toggleAll;
  }, [selection, ids, toggleAll, total, allPagesSelected]);

  const reset = useCallback(() => {
    setSelection([]);
    setAllPagesSelected(false);
  }, []);

  const isSelected = useCallback(
    (id: string) => {
      if (allPagesSelected) return true;
      return selection.includes(id);
    },
    [selection, allPagesSelected],
  );

  return useMemo(
    () => ({
      ref,
      selection,
      totalSelected: allPagesSelected ? total : selection.length,
      reset,
      isSelected,
      isCurrentPageSelected: arraysEqual(selection, ids) && selection.length !== total,
      isAllPagesSelected: allPagesSelected,
      toggle,
      toggleAllPages,
    }),
    [ref, reset, isSelected, toggle, toggleAllPages, allPagesSelected, selection, ids, total],
  );
};

function arraysEqual(a: Array<string>, b: Array<string>) {
  if (a.length !== b.length) return false;
  return a.every((item) => b.includes(item));
}
