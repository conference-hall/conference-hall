import { useState } from 'react';
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
  const [onlineChecked, setOnlineChanged] = useState<boolean>(onlineEvent);

  return (
    <Form id="details-form" method="POST" className="space-y-4 lg:space-y-6">
      {type === 'CONFERENCE' && (
        <DateRangeInput
          start={{ name: 'conferenceStart', label: 'Start date', value: conferenceStart }}
          end={{ name: 'conferenceEnd', label: 'End date', value: conferenceEnd }}
          timezone={timezone}
          error={errors?.conferenceStart}
        />
      )}

      <ToggleGroup
        name="onlineEvent"
        label="Is online event?"
        description="Indicate whether the event will be held online."
        value={onlineChecked}
        onChange={setOnlineChanged}
        reverse
      />

      {!onlineChecked ? (
        <Input
          name="location"
          label="Venue location (address, city, country)"
          autoComplete="off"
          defaultValue={location || ''}
          error={errors?.location}
        />
      ) : null}

      <MarkdownTextArea
        name="description"
        label="Description"
        defaultValue={description || ''}
        rows={5}
        autoComplete="off"
        error={errors?.description}
      />

      {!compact ? (
        <Input name="websiteUrl" label="Website URL" defaultValue={websiteUrl || ''} error={errors?.websiteUrl} />
      ) : null}

      {!compact ? (
        <Input
          name="contactEmail"
          label="Contact email"
          defaultValue={contactEmail || ''}
          error={errors?.contactEmail}
        />
      ) : null}

      <input type="hidden" name="timezone" value={timezone} />
    </Form>
  );
}
