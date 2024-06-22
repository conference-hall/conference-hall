import { Container } from '~/design-system/layouts/container.cap.tsx';
import { NavTab, NavTabs } from '~/design-system/navigation/nav-tabs.tsx';
import type { EventType } from '~/types/events.types';

type Props = { slug: string; type: EventType; surveyEnabled: boolean };

export function EventTabs({ slug, type, surveyEnabled }: Props) {
  return (
    <div className="bg-gray-800">
      <Container>
        <NavTabs variant="dark" py={4} scrollable>
          <NavTab to={`/${slug}`} end variant="dark">
            {type === 'CONFERENCE' ? 'Conference' : 'Meetup'}
          </NavTab>

          <NavTab to={`/${slug}/proposals`} variant="dark">
            Your proposals
          </NavTab>

          {surveyEnabled ? (
            <NavTab to={`/${slug}/survey`} variant="dark">
              Survey
            </NavTab>
          ) : null}
        </NavTabs>
      </Container>
    </div>
  );
}
