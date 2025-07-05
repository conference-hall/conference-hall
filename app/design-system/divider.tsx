import { cx } from 'class-variance-authority';

type DividerProps = { as?: React.ElementType; className?: string };

export function Divider({ as: Tag = 'div', className }: DividerProps) {
  return <Tag role="presentation" aria-hidden="true" className={cx('border-t border-gray-200', className)} />;
}

type DividerWithLabelProps = { label: string; className?: string };

export function DividerWithLabel({ label, className }: DividerWithLabelProps) {
  return (
    <div className={cx('relative', className)} role="presentation">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200" />
      </div>
      <div className="relative flex justify-center text-sm font-medium leading-6">
        <span className="bg-white px-6 text-gray-900">{label}</span>
      </div>
    </div>
  );
}
