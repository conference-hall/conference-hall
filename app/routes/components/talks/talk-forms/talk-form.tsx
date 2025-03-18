import { Form } from 'react-router';

import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import MultiSelect from '~/design-system/forms/multi-select.tsx';
import { Radio, RadioGroup } from '~/design-system/forms/radio-group.tsx';
import { LANGUAGES } from '~/libs/formatters/languages.ts';
import { LEVELS } from '~/libs/formatters/levels.ts';
import type { SubmissionErrors } from '~/types/errors.types.ts';

import { CategoriesForm } from './categories-form.tsx';
import { FormatsForm } from './formats-form.tsx';

type Props = {
  id: string;
  initialValues?: {
    title: string;
    abstract: string;
    references: string | null;
    languages: string[];
    level: string | null;
    formats?: Array<{ id: string }>;
    categories?: Array<{ id: string }>;
  } | null;
  formats?: Array<{ id: string; name: string; description: string | null }>;
  formatsRequired?: boolean;
  formatsAllowMultiple?: boolean;
  categories?: Array<{ id: string; name: string; description: string | null }>;
  categoriesRequired?: boolean;
  categoriesAllowMultiple?: boolean;
  errors: SubmissionErrors;
  onSubmit?: VoidFunction;
};

export function TalkForm({
  id,
  initialValues,
  formats,
  formatsRequired,
  formatsAllowMultiple,
  categories,
  categoriesRequired,
  categoriesAllowMultiple,
  errors,
  onSubmit,
}: Props) {
  const hasFormats = formats && formats.length > 0;
  const hasCategories = categories && categories.length > 0;

  return (
    <Form id={id} method="POST" className="space-y-6 lg:space-y-8" onSubmit={onSubmit}>
      <Input
        name="title"
        type="text"
        label="Title"
        required
        defaultValue={initialValues?.title}
        error={errors?.title}
      />

      <MarkdownTextArea
        name="abstract"
        label="Abstract"
        description="Brief description of the talk. Markdown is supported "
        required
        rows={6}
        defaultValue={initialValues?.abstract}
        error={errors?.abstract}
      />

      <RadioGroup label="Level" inline>
        {LEVELS.map(({ key, label }) => (
          <Radio name="level" key={key} id={key} value={key} defaultChecked={initialValues?.level === key}>
            {label}
          </Radio>
        ))}
      </RadioGroup>

      <MultiSelect
        name="languages"
        label="Languages"
        placeholder="Select spoken languages for the talk."
        options={LANGUAGES}
        defaultValues={initialValues?.languages ?? []}
      />

      {hasFormats && (
        <FormatsForm
          formatsAllowMultiple={formatsAllowMultiple ?? false}
          formats={formats}
          required={formatsRequired}
          initialValues={initialValues?.formats?.map(({ id }) => id)}
        />
      )}
      {errors?.formats && <Callout title="You have to select at least one proposal format." variant="error" />}

      {hasCategories && (
        <CategoriesForm
          categoriesAllowMultiple={categoriesAllowMultiple ?? false}
          categories={categories}
          required={categoriesRequired}
          initialValues={initialValues?.categories?.map(({ id }) => id)}
        />
      )}
      {errors?.categories && <Callout title="You have to select at least one proposal category." variant="error" />}

      <MarkdownTextArea
        name="references"
        label="References"
        description="Give more info about your talk: slides, workshop pre-requities, github repo, video, summary, steps of the talk, which conference or meetup where it has been already given?"
        rows={4}
        defaultValue={initialValues?.references ?? ''}
        error={errors?.references}
      />
    </Form>
  );
}
