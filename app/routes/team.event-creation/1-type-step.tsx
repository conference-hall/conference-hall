import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { href } from 'react-router';
import { requireUserSession } from '~/libs/auth/session.ts';
import { useCurrentTeam } from '~/routes/components/contexts/team-context.tsx';
import { FullscreenPage } from '~/routes/components/fullscreen-page.tsx';
import { ButtonLink } from '~/shared/design-system/buttons.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import type { EventType } from '~/types/events.types.ts';
import { EventTypeRadioGroup } from '../components/events/event-type-radio-group.tsx';
import type { Route } from './+types/1-type-step.ts';

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
