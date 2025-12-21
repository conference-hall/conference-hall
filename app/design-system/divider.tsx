import { cva, cx } from 'class-variance-authority';

type DividerProps = { as?: React.ElementType; className?: string };

export function Divider({ as: Tag = 'div', className }: DividerProps) {
  return <Tag role="presentation" aria-hidden="true" className={cx('border-gray-200 border-t', className)} />;
}

type DividerWithLabelProps = {
  label: string;
  placement?: 'start' | 'center' | 'end';
  className?: string;
};

const dividerLabelStyle = cva('text-nowrap', {
  variants: {
    placement: {
      start: 'pr-4',
      center: 'px-4',
      end: 'pl-4',
    },
  },
});

export function DividerWithLabel({ label, placement = 'center', className }: DividerWithLabelProps) {
  return (
    <div className={cx('flex items-center font-medium text-gray-600 text-sm', className)} role="presentation">
      {placement !== 'start' ? <div className="w-full border-gray-200 border-t" aria-hidden="true" /> : null}
      <div className={dividerLabelStyle({ placement })}>{label}</div>
      {placement !== 'end' ? <div className="w-full border-gray-200 border-t" aria-hidden="true" /> : null}
    </div>
  );
}
