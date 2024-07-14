import { Link } from '@remix-run/react';

import { ConferenceHallLogo } from '~/design-system/logo.tsx';
import { Text } from '~/design-system/typography.tsx';

type Props = { displayName?: boolean };

export function Logo({ displayName }: Props) {
  return (
    <Link
      to="/"
      title="Go to event search"
      className="flex items-center gap-4 truncate rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
    >
      <ConferenceHallLogo width="32px" height="32px" aria-hidden className="fill-indigo-400" />
      {displayName && (
        <Text as="span" weight={'bold'} variant="light" size="l" truncate>
          Conference Hall
        </Text>
      )}
    </Link>
  );
}
