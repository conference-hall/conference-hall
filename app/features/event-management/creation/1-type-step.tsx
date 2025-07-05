import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { ButtonLink } from '~/design-system/buttons.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { useCurrentTeam } from '~/features/team-management/team-context.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { EventType } from '~/shared/types/events.types.ts';
import type { Route } from './+types/1-type-step.ts';
import { EventTypeRadioGroup } from './components/event-type-radio-group.tsx';

export const loader = async ({ request }: Route.LoaderArgs) => {
  await requireUserSession(request);
  return null;
};

export default function NewEventTypeRoute() {
  const { t } = useTranslation();
  const currentTeam = useCurrentTeam();
  const [type, setType] = useState<EventType>('CONFERENCE');

  return (
    <>
      <FullscreenPage.Title
        title={t('event-management.new.type-form.heading')}
        subtitle={t('event-management.new.type-form.description')}
      />

      <Card>
        <Card.Content>
          <EventTypeRadioGroup selected={type} onSelect={setType} />
        </Card.Content>

        <Card.Actions>
          <ButtonLink to={href('/team/:team', { team: currentTeam.slug })} type="button" variant="secondary">
            {t('common.cancel')}
          </ButtonLink>
          <ButtonLink
            to={href('/team/:team/new/type/:type', { team: currentTeam.slug, type })}
            type="button"
            replace
            iconRight={ArrowRightIcon}
          >
            {t('common.continue')}
          </ButtonLink>
        </Card.Actions>
      </Card>
    </>
  );
}
