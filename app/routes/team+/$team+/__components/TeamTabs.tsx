import { PlusIcon } from '@heroicons/react/20/solid';

import { ButtonLink } from '~/design-system/Buttons.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/NavTabs.tsx';

type Props = { slug: string; role: string };

export function TeamTabs({ slug, role }: Props) {
  return (
    <div className="flex flex-col pb-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-0">
      <NavTabs py={4} scrollable>
        <NavTab to={`/team/${slug}`} end>
          Events
        </NavTab>
        {role === 'OWNER' ? <NavTab to={`/team/${slug}/settings`}>Settings</NavTab> : null}
      </NavTabs>

      {role === 'OWNER' ? (
        <ButtonLink to={`/team/${slug}/new`} variant="secondary" iconLeft={PlusIcon}>
          New event
        </ButtonLink>
      ) : null}
    </div>
  );
}
