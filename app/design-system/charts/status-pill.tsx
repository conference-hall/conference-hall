import { cva, cx, type VariantProps } from 'class-variance-authority';

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

const pingStyles = cva('absolute inline-flex h-full w-full rounded-full opacity-75', {
  variants: {
    status: {
      success: 'bg-green-400',
      error: 'bg-red-400',
      warning: 'bg-orange-400',
      info: 'bg-blue-400',
      disabled: 'bg-gray-400',
    },
  },
  defaultVariants: { status: 'info' },
});

export type StatusPillProps = VariantProps<typeof styles> & { ping?: boolean; className?: string };

export function StatusPill({ ping, className, ...props }: StatusPillProps) {
  if (ping) {
    return (
      <span className={cx('relative flex shrink-0', className)} aria-hidden="true">
        <span className={`${pingStyles(props)} animate-ping`} />
        <span className={styles(props)} />
      </span>
    );
  }
  return <span className={cx(styles(props), className)} aria-hidden="true" />;
}
