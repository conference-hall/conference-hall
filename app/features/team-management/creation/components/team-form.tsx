import slugify from '@sindresorhus/slugify';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input } from '~/design-system/forms/input.tsx';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';

type TeamFormProps = {
  initialValues?: { name: string; slug: string };
  errors: SubmissionErrors;
};

export function TeamForm({ initialValues, errors }: TeamFormProps) {
  const { t } = useTranslation();
  const [name, setName] = useState<string>(initialValues?.name ?? '');
  const [slug, setSlug] = useState<string>(initialValues?.slug ?? '');

  return (
    <>
      <Input
        name="name"
        label={t('team.fields.name')}
        required
        autoComplete="off"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSlug(slugify(e.target.value.toLowerCase()));
        }}
        error={errors?.name}
      />
      <Input
        name="slug"
        label={t('team.fields.slug')}
        addon="https://conference-hall.io/team/"
        required
        autoComplete="off"
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
        }}
        error={errors?.slug}
      />
    </>
  );
}
