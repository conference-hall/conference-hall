import { cx } from 'class-variance-authority';

type Props = { as?: React.ElementType; className?: string };

export function Divider({ as: Tag = 'div', className }: Props) {
  return <Tag role="presentation" aria-hidden="true" className={cx('border-t border-gray-200', className)} />;
}
