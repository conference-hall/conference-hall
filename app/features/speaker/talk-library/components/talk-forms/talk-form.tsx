import { useTranslation } from 'react-i18next';
import { Form } from 'react-router';
import { Callout } from '~/design-system/callout.tsx';
import { FieldsetGroup } from '~/design-system/forms/fieldset-group.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Radio } from '~/design-system/forms/input-radio.tsx';
import { MarkdownTextArea } from '~/design-system/forms/markdown-textarea.tsx';
import MultiSelect from '~/design-system/forms/multi-select.tsx';
import { LANGUAGES, TALK_LEVELS } from '~/shared/constants.ts';
import type { SubmissionErrors } from '~/shared/types/errors.types.ts';
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
  const { t } = useTranslation();

  const hasFormats = formats && formats.length > 0;
  const hasCategories = categories && categories.length > 0;

  return (
    <Form id={id} method="POST" className="space-y-6 lg:space-y-8" onSubmit={onSubmit}>
      <Input
        name="title"
        type="text"
        label={t('talk.title')}
        required
        defaultValue={initialValues?.title}
        error={errors?.title}
      />

      <MarkdownTextArea
        name="abstract"
        label={t('talk.abstract')}
        description={t('talk.abstract.description')}
        required
        rows={6}
        defaultValue={initialValues?.abstract}
        error={errors?.abstract}
      />

      <FieldsetGroup label={t('talk.level')} inline>
        {TALK_LEVELS.map((level) => (
          <Radio name="level" key={level} value={level} defaultChecked={initialValues?.level === level}>
            {t(`common.level.${level}`)}
          </Radio>
        ))}
      </FieldsetGroup>

      <MultiSelect
        name="languages"
        label={t('talk.languages')}
        placeholder={t('talk.languages.placeholder')}
        options={LANGUAGES.map((lang) => ({
          value: lang,
          label: `${t(`common.languages.${lang}.flag`)} ${t(`common.languages.${lang}.label`)}`,
        }))}
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
      {hasFormats && errors?.formats && <Callout title={t('talk.errors.formats.required')} variant="error" />}

      {hasCategories && (
        <CategoriesForm
          categoriesAllowMultiple={categoriesAllowMultiple ?? false}
          categories={categories}
          required={categoriesRequired}
          initialValues={initialValues?.categories?.map(({ id }) => id)}
        />
      )}
      {hasCategories && errors?.categories && <Callout title={t('talk.errors.categories.required')} variant="error" />}

      <MarkdownTextArea
        name="references"
        label={t('talk.references')}
        description={t('talk.references.description')}
        rows={4}
        defaultValue={initialValues?.references ?? ''}
        error={errors?.references}
      />
    </Form>
  );
}
