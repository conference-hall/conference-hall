import { Link } from '@remix-run/react';
import { cx } from 'class-variance-authority';

import { Avatar } from '~/design-system/avatar.tsx';

const menuStyle = cx(
  'flex items-center gap-2',
  'text-sm font-semibold whitespace-nowrap',
  'text-gray-100 hover:bg-gray-900 hover:text-white focus-visible:outline-white',
  'px-3 py-1.5 rounded-md focus-visible:outline focus-visible:outline-2',
);

type Props = { currentTeamSlug?: string; event: { slug: string; name: string; logo: string | null } };

export function EventButton({ currentTeamSlug, event }: Props) {
  if (!currentTeamSlug) return null;

  return (
    <Link to={`/team/${currentTeamSlug}/${event.slug}`} className={menuStyle}>
      <Avatar size="xs" picture={event.logo} name={event.name} square aria-hidden />
      <span>{event.name}</span>
    </Link>
  );
}
