import slugify from '@sindresorhus/slugify';
import { useState } from 'react';
import { useActionData } from '@remix-run/react';
import { Input } from '~/design-system/forms/Input';

type OrganizationFormProps = {
  initialValues?: { name: string; slug: string };
};

export function OrganizationNewForm({ initialValues }: OrganizationFormProps) {
  const result = useActionData();

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
        error={result?.fieldErrors?.name?.[0]}
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
        error={result?.fieldErrors?.slug?.[0]}
        className="mt-4"
      />
    </>
  );
}
