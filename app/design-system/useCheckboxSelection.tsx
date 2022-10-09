import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export const useCheckboxSelection = (items: Array<string>) => {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const [checked, setChecked] = useState(false);
  const [selection, setSelected] = useState<Array<string>>([]);
  const [indeterminate, setIndeterminate] = useState(false);

  useEffect(() => {
    const isIndeterminate = selection.length > 0 && selection.length < items.length;
    setChecked(items.length !== 0 && selection.length === items.length);
    setIndeterminate(isIndeterminate);
    checkboxRef!.current!.indeterminate = isIndeterminate;
  }, [selection, items]);

  const toggleAll = useCallback(() => {
    setSelected(checked || indeterminate ? [] : items);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }, [items, checked, indeterminate]);

  const onSelect = useCallback(
    (item: string, isSelected: boolean) => {
      if (isSelected) {
        return setSelected([...selection, item]);
      }
      return setSelected(selection.filter((id) => id !== item));
    },
    [selection]
  );

  const isSelected = useCallback((item: string) => selection.includes(item), [selection]);

  const value = useMemo(
    () => ({
      checkboxRef,
      selection,
      checked,
      isSelected,
      onSelect,
      toggleAll,
    }),
    [checkboxRef, selection, checked, isSelected, onSelect, toggleAll]
  );

  return value;
};
