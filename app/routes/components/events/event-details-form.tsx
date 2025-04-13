import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';

import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import { ToggleGroup } from '~/design-system/forms/toggles.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';
import type { EventType } from '~/types/events.types.ts';

type Props = {
  type: EventType;
  timezone: string;
  conferenceStart: Date | null;
  conferenceEnd: Date | null;
  onlineEvent: boolean;
  location: string | null;
  description: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  compact?: boolean;
  errors: SubmissionErrors;
};

export function EventDetailsForm({
  type,
  timezone,
  conferenceStart,
  conferenceEnd,
  onlineEvent,
  location,
  description,
  websiteUrl,
  contactEmail,
  compact,
  errors,
}: Props) {
  const { t } = useTranslation();
  const [onlineChecked, setOnlineChanged] = useState<boolean>(onlineEvent);

  return (
    <Form id="details-form" method="POST" className="space-y-4 lg:space-y-6">
      {type === 'CONFERENCE' && (
        <DateRangeInput
          start={{ name: 'conferenceStart', label: t('event-management.fields.start-date'), value: conferenceStart }}
          end={{ name: 'conferenceEnd', label: t('event-management.fields.end-date'), value: conferenceEnd }}
          timezone={timezone}
          error={errors?.conferenceStart}
        />
      )}

      <ToggleGroup
        name="onlineEvent"
        label={t('event-management.fields.online')}
        description={t('event-management.fields.online.description')}
        value={onlineChecked}
        onChange={setOnlineChanged}
        reverse
      />

      {!onlineChecked ? (
        <Input
          name="location"
          label={t('event-management.fields.location')}
          autoComplete="off"
          defaultValue={location || ''}
          error={errors?.location}
        />
      ) : null}

      <MarkdownTextArea
        name="description"
        label={t('event-management.fields.description')}
        defaultValue={description || ''}
        rows={5}
        autoComplete="off"
        error={errors?.description}
      />

      {!compact ? (
        <Input
          name="websiteUrl"
          label={t('event-management.fields.website')}
          defaultValue={websiteUrl || ''}
          error={errors?.websiteUrl}
        />
      ) : null}

      {!compact ? (
        <Input
          name="contactEmail"
          label={t('event-management.fields.contact-email')}
          defaultValue={contactEmail || ''}
          error={errors?.contactEmail}
        />
      ) : null}

      <input type="hidden" name="timezone" value={timezone} />
    </Form>
  );
}
