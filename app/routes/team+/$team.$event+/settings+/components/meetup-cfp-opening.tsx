import { useTranslation } from 'react-i18next';
import { Form, useFetcher } from 'react-router';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2 } from '~/design-system/typography.tsx';
import { formatTimezoneToUtc } from '~/libs/datetimes/timezone.ts';
import type { action } from '../cfp.tsx';

type Props = { cfpStart: Date | null; timezone: string };

export function MeetupCfpOpening({ cfpStart, timezone }: Props) {
  const { t } = useTranslation();
  const fetcher = useFetcher<typeof action>();

  const handleChange = (checked: boolean) => {
    fetcher.submit(
      {
        intent: 'save-cfp-meetup-opening',
        cfpStart: checked ? formatTimezoneToUtc(new Date(), timezone) : '',
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
