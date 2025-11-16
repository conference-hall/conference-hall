import type { EventType } from '@conference-hall/shared/types/events.types.ts';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { FullscreenPage } from '~/app-platform/components/fullscreen-page.tsx';
import { Button } from '~/design-system/button.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { requireUserSession } from '~/shared/auth/session.ts';
import type { Route } from './+types/1-type-step.ts';
import { EventTypeRadioGroup } from './components/event-type-radio-group.tsx';
import { useCurrentTeam } from './team-context.tsx';

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
          <Button to={href('/team/:team', { team: currentTeam.slug })} type="button" variant="secondary">
            {t('common.cancel')}
          </Button>
          <Button
            to={href('/team/:team/new/type/:type', { team: currentTeam.slug, type })}
            type="button"
            replace
            iconRight={ArrowRightIcon}
          >
            {t('common.continue')}
          </Button>
        </Card.Actions>
      </Card>
    </>
  );
}
