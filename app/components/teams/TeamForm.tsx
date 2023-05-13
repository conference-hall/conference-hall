import slugify from '@sindresorhus/slugify';
import { useState } from 'react';
import { Input } from '~/design-system/forms/Input';

type TeamFormProps = {
  initialValues?: { name: string; slug: string };
  errors?: Record<string, string | string[]>;
};

export function TeamForm({ initialValues, errors }: TeamFormProps) {
  const [name, setName] = useState<string>(initialValues?.name ?? '');
  const [slug, setSlug] = useState<string>(initialValues?.slug ?? '');

  return (
    <>
      <Input
        name="name"
        label="Team name"
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
        label="Team URL"
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
