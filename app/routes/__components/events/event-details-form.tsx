import { Form } from '@remix-run/react';

import { DateRangeInput } from '~/design-system/forms/date-range-input.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';
import type { EventType } from '~/types/events.types.ts';

type Props = {
  type: EventType;
  timezone: string;
  conferenceStart: string | undefined;
  conferenceEnd: string | undefined;
  address: string | null;
  description: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  errors: SubmissionErrors;
};

export function EventDetailsForm({
  type,
  timezone,
  conferenceStart,
  conferenceEnd,
  address,
  description,
  websiteUrl,
  contactEmail,
  errors,
}: Props) {
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

      <Input
        name="address"
        label="Venue address or city"
        autoComplete="off"
        defaultValue={address || ''}
        error={errors?.address}
      />

      <MarkdownTextArea
        name="description"
        label="Description"
        defaultValue={description || ''}
        rows={5}
        autoComplete="off"
        error={errors?.description}
      />

      <Input name="websiteUrl" label="Website URL" defaultValue={websiteUrl || ''} error={errors?.websiteUrl} />

      <Input name="contactEmail" label="Contact email" defaultValue={contactEmail || ''} error={errors?.contactEmail} />

      <input type="hidden" name="timezone" value={timezone} />
    </Form>
  );
}
