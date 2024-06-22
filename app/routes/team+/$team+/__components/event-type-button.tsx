import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';

import { Subtitle, Text } from '~/design-system/typography.tsx';

type EventTypeButtonProps = {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function EventTypeButton({ type, label, description, icon: Icon }: EventTypeButtonProps) {
  return (
    <Link
      to={`${type}`}
      className={cx(
        'border-gray-300 hover:border-indigo-600 hover:ring-2 hover:ring-indigo-600',
        'flex flex-col gap-4 rounded-lg border bg-white p-4 shadow-sm',
      )}
    >
      <div className="flex items-center gap-4">
        <Icon className="h-8 w-8 text-indigo-600" />
        <Text size="base" weight="semibold">
          {label}
        </Text>
      </div>
      <Subtitle>{description}</Subtitle>
    </Link>
  );
}
