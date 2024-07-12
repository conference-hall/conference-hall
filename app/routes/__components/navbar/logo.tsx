import { Link } from '@remix-run/react';

import { Text } from '~/design-system/typography.tsx';

type Props = { displayName?: boolean };

export function Logo({ displayName }: Props) {
  return (
    <Link
      to="/"
      title="Go to event search"
      className="flex items-center gap-4 truncate rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <img
        width="32px"
        height="32px"
        src="https://tailwindui.com/img/logos/workflow-mark-indigo-300.svg"
        aria-hidden
        alt=""
      />
      {displayName && (
        <Text as="span" weight={'bold'} variant="light" size="l" truncate>
          Conference Hall
        </Text>
      )}
    </Link>
  );
}
