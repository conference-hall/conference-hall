import { useTranslation } from 'react-i18next';
import { Form, useFetcher } from 'react-router';
import { timezoneToUtc } from '~/libs/datetimes/timezone.ts';
import { ToggleGroup } from '~/shared/design-system/forms/toggles.tsx';
import { Card } from '~/shared/design-system/layouts/card.tsx';
import { H2 } from '~/shared/design-system/typography.tsx';
import type { action } from '../cfp.tsx';

type Props = { cfpStart: Date | null; timezone: string };

export function MeetupCfpOpening({ cfpStart, timezone }: Props) {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof action>();

  const handleChange = (checked: boolean) => {
    fetcher.submit(
      {
        intent: 'save-cfp-meetup-opening',
        cfpStart: checked ? timezoneToUtc(new Date(), timezone).toISOString() : '',
      },
      { method: 'POST' },
    );
  };

  return (
    <Card as="section">
      <Card.Title>
        <H2>{t('event-management.settings.cfp.openings.heading')}</H2>
      </Card.Title>

      <Form method="POST">
        <Card.Content>
          <ToggleGroup
            label={t('event-management.settings.cfp.openings.activation.label')}
            description={t('event-management.settings.cfp.openings.activation.description')}
            value={Boolean(cfpStart)}
            onChange={handleChange}
          />
        </Card.Content>
      </Form>
    </Card>
  );
}
