import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type SelectAllState = 'none' | 'partial' | 'page' | 'all';

export const useListSelection = (ids: Array<string>, total: number, hash: string) => {
  const lastHash = useRef<string>(null);
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

  // Used to reset selection when the list has changed (using a hash corresponding to the list content)
  useEffect(() => {
    if (lastHash.current && lastHash.current !== hash) {
      reset();
    }
    lastHash.current = hash;
  }, [hash, reset]);

  const selectAllState: SelectAllState = useMemo(() => {
    if (allPagesSelected) return 'all';
    if (selection.length === 0) return 'none';
    if (ids.length > 0 && selection.length === ids.length) return 'page';
    return 'partial';
  }, [selection, ids, allPagesSelected]);

  return useMemo(
    () => ({
      selectAllState,
      selectAllDisabled: total === 0,
      selection,
      totalSelected: allPagesSelected ? total : selection.length,
      reset,
      isSelected,
      isCurrentPageSelected: selectAllState === 'page',
      isAllPagesSelected: allPagesSelected,
      toggle,
      toggleAll,
      toggleAllPages,
    }),
    [selectAllState, reset, isSelected, toggle, toggleAll, toggleAllPages, allPagesSelected, selection, total],
  );
};
