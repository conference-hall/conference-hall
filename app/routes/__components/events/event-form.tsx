import slugify from '@sindresorhus/slugify';
import { useState } from 'react';

import { Input } from '~/design-system/forms/input.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';

import { InputTimezone } from '../../../design-system/forms/input-timezone.tsx';
import { EventVisibilityRadioGroup } from './event-visibility-radio-group.tsx';

type Props = {
  initialValues?: {
    name: string;
    slug: string;
    visibility: 'PUBLIC' | 'PRIVATE';
    timezone: string;
  };
  errors: SubmissionErrors;
};

export function EventForm({ initialValues, errors }: Props) {
  const [name, setName] = useState<string>(initialValues?.name || '');
  const [slug, setSlug] = useState<string>(initialValues?.slug || '');

  return (
    <>
      <Input
        name="name"
        label="Name"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSlug(slugify(e.target.value.toLowerCase()));
        }}
        autoComplete="off"
        required
        error={errors?.name}
      />
      <Input
        name="slug"
        label="Event URL"
        addon="https://conference-hall.io/"
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
        }}
        autoComplete="off"
        required
        error={errors?.slug}
      />
      <EventVisibilityRadioGroup defaultValue={initialValues?.visibility} />
      <InputTimezone name="timezone" label="Event timezone" defaultValue={initialValues?.timezone} />
    </>
  );
}
