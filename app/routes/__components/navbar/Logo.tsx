import { Link } from '@remix-run/react';

import { Text } from '~/design-system/Typography.tsx';

type Props = { displayName?: boolean };

export function Logo({ displayName }: Props) {
  return (
    <Link to="/" title="Go to event search" className="flex items-center gap-4 truncate">
      <img className="h-8 w-8" src="https://tailwindui.com/img/logos/workflow-mark-indigo-300.svg" aria-hidden alt="" />
      {displayName && (
        <Text as="span" weight={'bold'} variant="light" size="l" truncate>
          Conference Hall
        </Text>
      )}
    </Link>
  );
}
