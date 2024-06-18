import { NavTab, NavTabs } from '~/design-system/navigation/NavTabs.tsx';
import type { EventType } from '~/types/events.types';

type Props = { teamSlug: string; eventSlug: string; eventType: EventType; role: string };

export function EventTabs({ teamSlug, eventSlug, eventType, role }: Props) {
  return (
    <NavTabs py={4} scrollable>
      <NavTab to={`/team/${teamSlug}/${eventSlug}`} end>
        Proposals reviews
      </NavTab>

      {role !== 'REVIEWER' && eventType === 'CONFERENCE' ? (
        <NavTab to={`/team/${teamSlug}/${eventSlug}/publication`} end>
          Publication
        </NavTab>
      ) : null}

      {role === 'OWNER' ? (
        <NavTab to={`/team/${teamSlug}/${eventSlug}/settings`} end>
          Settings
        </NavTab>
      ) : null}
    </NavTabs>
  );
}
