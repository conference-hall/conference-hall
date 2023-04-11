import { Text } from './Typography';
import { Card } from './Card';

type Icon = React.ComponentType<{ className?: string }>;

type Props = {
  icon: Icon;
  label?: string;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({ label, children, icon: Icon, className }: Props) {
  return (
    <Card p={24} className={className}>
      <div className="flex flex-col items-center text-center">
        <Icon className="mx-auto mb-4 h-24 w-24 text-gray-400" aria-hidden={true} />
        {label && (
          <Text variant="secondary" heading strong>
            {label}
          </Text>
        )}
        {children && <div className="mt-4">{children}</div>}
      </div>
    </Card>
  );
}
