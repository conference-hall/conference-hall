import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useCheckboxSelection = (items: Array<string>, total: number) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const [allChecked, setAllChecked] = useState(false);
  const [selection, setSelected] = useState<Array<string>>([]);
  const [indeterminate, setIndeterminate] = useState(false);

  useEffect(() => {
    const isIndeterminate = selection.length > 0 && selection.length < total;
    setAllChecked(total !== 0 && selection.length === total);
    setIndeterminate(isIndeterminate);
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = isIndeterminate;
    }
  }, [selection, items, total]);

  const toggleAll = useCallback(() => {
    setSelected(allChecked || indeterminate ? [] : items);
    setAllChecked(!allChecked && !indeterminate);
  }, [items, allChecked, indeterminate]);

  const reset = useCallback(() => {
    setSelected([]);
    setAllChecked(false);
    setIndeterminate(false);
  }, []);

  const toggle = useCallback(
    (item: string, event: ChangeEvent<HTMLInputElement>) => {
      if (event.target.checked) {
        return setSelected([...selection, item]);
      }
      return setSelected(selection.filter((id) => id !== item));
    },
    [selection],
  );

  const isSelected = useCallback((item: string) => selection.includes(item), [selection]);

  const value = useMemo(
    () => ({
      checkboxRef,
      selection,
      allChecked,
      isSelected,
      isPageSelected: arraysEqual(selection, items) && selection.length !== total,
      toggle,
      toggleAll,
      reset,
    }),
    [checkboxRef, selection, items, allChecked, isSelected, toggle, total, toggleAll, reset],
  );

  return value;
};

function arraysEqual(a: Array<string>, b: Array<string>) {
  if (a.length !== b.length) return false;
  return a.every((item) => b.includes(item));
}
