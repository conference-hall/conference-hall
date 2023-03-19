import slugify from '@sindresorhus/slugify';
import { useState } from 'react';
import { Input } from '~/design-system/forms/Input';

type OrganizationFormProps = {
  initialValues?: { name: string; slug: string };
  errors?: Record<string, string>;
};

export function OrganizationForm({ initialValues, errors }: OrganizationFormProps) {
  const [name, setName] = useState<string>(initialValues?.name ?? '');
  const [slug, setSlug] = useState<string>(initialValues?.slug ?? '');

  return (
    <>
      <Input
        name="name"
        label="Organization name"
        required
        autoComplete="off"
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setSlug(slugify(e.target.value.toLowerCase()));
        }}
        error={errors?.name}
        className="mt-8"
      />
      <Input
        name="slug"
        label="Organization slug"
        required
        autoComplete="off"
        value={slug}
        onChange={(e) => {
          setSlug(e.target.value);
        }}
        error={errors?.slug}
        className="mt-4"
      />
    </>
  );
}
