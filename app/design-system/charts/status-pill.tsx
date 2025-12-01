import { cva, type VariantProps } from 'class-variance-authority';

const styles = cva('flex shrink-0 rounded-full', {
  variants: {
    status: {
      success: 'bg-green-400',
      error: 'bg-red-400',
      warning: 'bg-orange-400',
      info: 'bg-blue-400',
      disabled: 'bg-gray-400',
    },
    size: {
      base: 'h-3 w-3',
      sm: 'h-2 w-2',
    },
  },
  defaultVariants: { status: 'info', size: 'base' },
});

export type StatusPillProps = VariantProps<typeof styles>;

export function StatusPill(props: StatusPillProps) {
  return <span className={styles(props)} aria-hidden="true" />;
}
