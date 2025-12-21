import { XMarkIcon } from '@heroicons/react/20/solid';
import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

const defaultBadge = cva('inline-flex items-center gap-1 text-nowrap', {
  variants: {
    color: {
      gray: 'bg-gray-100 text-gray-800 ring-1 ring-gray-500/10 ring-inset',
      red: 'bg-red-50 text-red-700 ring-1 ring-red-600/10 ring-inset',
      yellow: 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-600/20 ring-inset',
      green: 'bg-green-50 text-green-700 ring-1 ring-green-600/20 ring-inset',
      blue: 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10 ring-inset',
      indigo: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-700/10 ring-inset',
      purple: 'bg-purple-50 text-purple-700 ring-1 ring-purple-700/10 ring-inset',
      pink: 'bg-pink-50 text-pink-700 ring-1 ring-pink-700/10 ring-inset',
    },
    compact: { true: 'h-5 px-1.5 py-0.5 font-medium text-[10px]', false: 'px-2 py-0.5 font-medium text-xs' },
    pill: { true: 'rounded-full', false: 'rounded-md' },
  },
  defaultVariants: { color: 'gray', pill: false, compact: false },
});

const dotBadge = cva(
  'inline-flex items-center gap-x-1.5 text-nowrap font-semibold text-gray-600 text-xs ring-1 ring-gray-200 ring-inset',
  {
    variants: {
      color: {
        gray: 'fill-gray-500',
        red: 'fill-red-500',
        yellow: 'fill-yellow-500',
        green: 'fill-green-500',
        blue: 'fill-blue-500',
        indigo: 'fill-indigo-500',
        purple: 'fill-purple-500',
        pink: 'fill-pink-500',
      },
      compact: { true: 'px-2 py-0.5', false: 'px-2 py-1' },
      pill: { true: 'rounded-full', false: 'rounded-md' },
    },
    defaultVariants: { color: 'gray', pill: false, compact: false },
  },
);

type BadgeProps = { children: React.ReactNode; closeLabel?: string; onClose?: () => void } & VariantProps<
  typeof defaultBadge
>;

export function Badge({ color, pill, compact, children, closeLabel, onClose }: BadgeProps) {
  return (
    <span className={defaultBadge({ color, pill, compact })}>
      {children}
      {onClose && closeLabel ? <CloseButton closeLabel={closeLabel} onClose={onClose} /> : null}
    </span>
  );
}

type BadgeDotProps = { children: React.ReactNode; closeLabel?: string; onClose?: () => void } & VariantProps<
  typeof dotBadge
>;

export function BadgeDot({ color, pill, compact, children, closeLabel, onClose }: BadgeDotProps) {
  return (
    <span className={dotBadge({ color, pill, compact })}>
      <svg className="h-1.5 w-1.5" viewBox="0 0 6 6" aria-hidden="true">
        <circle cx={3} cy={3} r={3} />
      </svg>
      {children}
      {onClose && closeLabel ? <CloseButton closeLabel={closeLabel} onClose={onClose} /> : null}
    </span>
  );
}

type CloseButtonProps = { closeLabel: string; onClose: () => void };

function CloseButton({ closeLabel, onClose }: CloseButtonProps) {
  const { t } = useTranslation();
  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={t('common.remove-item', { item: closeLabel })}
      onPointerDown={(e) => {
        e.stopPropagation();
        e.preventDefault();
      }}
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        onClose();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }
      }}
      className="-mr-1 cursor-pointer rounded-full p-0.5 hover:bg-black/10"
    >
      <XMarkIcon className="h-3 w-3" aria-hidden="true" />
    </span>
  );
}
