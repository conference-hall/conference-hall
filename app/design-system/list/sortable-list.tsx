import type { Customizable, Plugins } from '@dnd-kit/abstract';
import { Accessibility, PointerActivationConstraints } from '@dnd-kit/dom';
import { DragDropProvider, PointerSensor } from '@dnd-kit/react';
import { isSortable, useSortable } from '@dnd-kit/react/sortable';
import { cx } from 'class-variance-authority';
import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GripIcon } from '../icons/grip-icon.tsx';
import { Text } from '../typography.tsx';
import { List } from './list.tsx';

type SortableItem = { id: string };

type SortableListProps<T extends SortableItem> = {
  items: Array<T>;
  getLabel: (item: T) => string;
  onReorder: (id: string, targetIndex: number) => void;
  children: (item: T) => ReactNode;
  footer?: ReactNode;
  'aria-label'?: string;
};

type Grabbed = { id: string; initialOrder: Array<string> };

const sensors = [
  PointerSensor.configure({ activationConstraints: [new PointerActivationConstraints.Distance({ value: 5 })] }),
];

const withoutAccessibility: Customizable<Plugins> = (defaults) => defaults.filter((plugin) => plugin !== Accessibility);

function moveId(order: Array<string>, id: string, targetIndex: number) {
  const next = order.filter((current) => current !== id);
  next.splice(targetIndex, 0, id);
  return next;
}

export function SortableList<T extends SortableItem>({
  items,
  getLabel,
  onReorder,
  children,
  footer,
  'aria-label': ariaLabel,
}: SortableListProps<T>) {
  const { t } = useTranslation();
  const instructionsId = useId();

  const [prevItems, setPrevItems] = useState(items);
  const [order, setOrder] = useState(() => items.map((item) => item.id));
  const [grabbed, setGrabbed] = useState<Grabbed | null>(null);
  const [announcement, setAnnouncement] = useState('');

  if (items !== prevItems) {
    setPrevItems(items);
    setOrder(items.map((item) => item.id));
    setGrabbed(null);
  }

  const itemsById = new Map(items.map((item) => [item.id, item]));
  const orderedItems = order.map((id) => itemsById.get(id)).filter((item): item is T => item !== undefined);
  const total = orderedItems.length;
  const sortable = total > 1;

  const handles = useRef(new Map<string, HTMLButtonElement>());
  useEffect(() => {
    if (grabbed) handles.current.get(grabbed.id)?.focus();
  }, [grabbed, order]);

  const announce = (key: 'grabbed' | 'moved' | 'dropped' | 'cancelled', item: T, position: number) => {
    const values = { label: getLabel(item), position, total, interpolation: { escapeValue: false } };
    const messages = {
      grabbed: () => t('common.sortable.announcements.grabbed', values),
      moved: () => t('common.sortable.announcements.moved', values),
      dropped: () => t('common.sortable.announcements.dropped', values),
      cancelled: () => t('common.sortable.announcements.cancelled', values),
    };
    setAnnouncement(messages[key]());
  };

  const handleKeyDown = (item: T) => (event: KeyboardEvent<HTMLButtonElement>) => {
    const index = order.indexOf(item.id);
    const isGrabbed = grabbed?.id === item.id;

    if (event.key === ' ') {
      event.preventDefault();
      if (!isGrabbed) {
        setGrabbed({ id: item.id, initialOrder: order });
        announce('grabbed', item, index + 1);
        return;
      }
      setGrabbed(null);
      announce('dropped', item, index + 1);
      if (index !== grabbed.initialOrder.indexOf(item.id)) onReorder(item.id, index);
      return;
    }

    if (!isGrabbed) return;

    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      const target = event.key === 'ArrowUp' ? index - 1 : index + 1;
      if (target < 0 || target >= total) return;
      setOrder(moveId(order, item.id, target));
      announce('moved', item, target + 1);
    } else if (event.key === 'Escape' || event.key === 'Tab') {
      if (event.key === 'Escape') event.preventDefault();
      setOrder(grabbed.initialOrder);
      setGrabbed(null);
      announce('cancelled', item, grabbed.initialOrder.indexOf(item.id) + 1);
    }
  };

  const handleBlur = () => {
    if (!grabbed) return;
    const { id, initialOrder } = grabbed;
    setTimeout(() => {
      if (document.activeElement === handles.current.get(id)) return;
      setOrder(initialOrder);
      setGrabbed(null);
    });
  };

  const grabbedPosition = grabbed ? order.indexOf(grabbed.id) + 1 : 0;

  return (
    <DragDropProvider
      sensors={sensors}
      plugins={withoutAccessibility}
      onDragEnd={(event) => {
        const { source } = event.operation;
        if (event.canceled || !isSortable(source)) return;
        const { initialIndex, index } = source;
        if (initialIndex === index) return;
        const id = String(source.id);
        setOrder((current) => moveId(current, id, index));
        onReorder(id, index);
      }}
    >
      <List.Content aria-label={ariaLabel}>
        {orderedItems.map((item, index) => (
          <SortableRow
            key={item.id}
            id={item.id}
            index={index}
            sortable={sortable}
            label={getLabel(item)}
            grabbed={grabbed?.id === item.id}
            instructionsId={instructionsId}
            handleRef={(element) => {
              if (element) handles.current.set(item.id, element);
              else handles.current.delete(item.id);
            }}
            onKeyDown={handleKeyDown(item)}
            onBlur={handleBlur}
          >
            {children(item)}
          </SortableRow>
        ))}
      </List.Content>

      {grabbed ? (
        <List.Footer>
          <Text size="xs" variant="secondary">
            {t('common.sortable.footer.shortcuts')}
          </Text>
          <Text size="xs" weight="medium">
            {t('common.sortable.footer.position', { position: grabbedPosition, total })}
          </Text>
        </List.Footer>
      ) : footer ? (
        <List.Footer>{footer}</List.Footer>
      ) : null}

      {sortable ? (
        <p id={instructionsId} className="sr-only">
          {t('common.sortable.instructions')}
        </p>
      ) : null}
      <div role="status" aria-live="assertive" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </DragDropProvider>
  );
}

type SortableRowProps = {
  id: string;
  index: number;
  sortable: boolean;
  label: string;
  grabbed: boolean;
  instructionsId: string;
  handleRef: (element: HTMLButtonElement | null) => void;
  onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
  onBlur: () => void;
  children: ReactNode;
};

function SortableRow({
  id,
  index,
  sortable,
  label,
  grabbed,
  instructionsId,
  handleRef,
  onKeyDown,
  onBlur,
  children,
}: SortableRowProps) {
  const { t } = useTranslation();
  const { ref, handleRef: dndHandleRef, isDragging } = useSortable({ id, index, disabled: !sortable });

  return (
    <li
      ref={ref}
      className={cx(
        'relative flex items-center gap-3 bg-white p-4',
        "data-dnd-placeholder:after:visible data-dnd-placeholder:after:absolute data-dnd-placeholder:after:inset-1 data-dnd-placeholder:after:rounded-md data-dnd-placeholder:after:border-2 data-dnd-placeholder:after:border-dashed data-dnd-placeholder:after:border-indigo-400 data-dnd-placeholder:after:bg-indigo-50 data-dnd-placeholder:after:content-['']",
        { 'rounded-md shadow-lg ring-1 ring-gray-200': isDragging, 'bg-indigo-50': grabbed },
      )}
    >
      {sortable ? (
        <div className="relative shrink-0">
          <button
            ref={(element) => {
              dndHandleRef(element);
              handleRef(element);
            }}
            type="button"
            aria-label={t('common.sortable.handle-label', { label, interpolation: { escapeValue: false } })}
            aria-describedby={instructionsId}
            onKeyDown={onKeyDown}
            onBlur={onBlur}
            className="peer flex h-8 w-5 cursor-grab touch-none items-center justify-center rounded-sm text-gray-300 hover:text-gray-600 focus-visible:text-gray-600 focus-visible:outline-2 focus-visible:outline-indigo-600 active:cursor-grabbing"
          >
            <GripIcon className="h-4 w-2.5" />
          </button>
          {!grabbed ? (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute top-full left-0 z-10 mt-1 hidden rounded-lg bg-gray-800 px-2 py-1 text-xs font-medium whitespace-nowrap text-white peer-focus-visible:block"
            >
              {t('common.sortable.tooltip')}
            </span>
          ) : null}
        </div>
      ) : null}
      <div className="min-w-0 flex-1">{children}</div>
    </li>
  );
}
