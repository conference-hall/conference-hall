import { cx } from 'class-variance-authority';
import { Text } from '../typography.tsx';
import { Card } from './card.tsx';

type Icon = React.ComponentType<{ className?: string }>;

type Props = {
  icon?: Icon;
  label?: string;
  noBorder?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({ label, children, icon: Icon, noBorder, className }: Props) {
  return (
    <Card p={16} noBorder={noBorder} className={cx('w-full', className)}>
      <div className="flex flex-col items-center text-center">
        {Icon && <Icon className="mx-auto mb-4 h-12 w-12 text-gray-400" aria-hidden={true} />}
        {label && (
          <Text variant="secondary" weight="semibold">
            {label}
          </Text>
        )}
        {children && <div className="mt-8 w-full">{children}</div>}
      </div>
    </Card>
  );
}
