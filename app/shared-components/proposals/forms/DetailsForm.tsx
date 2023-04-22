import { Input } from '~/design-system/forms/Input';
import { Radio, RadioGroup } from '~/design-system/forms/RadioGroup';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import { LEVELS } from '../../../utils/levels';
import MultiSelect from '~/design-system/forms/MultiSelect';
import { LANGUAGES } from '~/utils/languages';
import { FormatsForm } from './FormatsForm';
import { CategoriesForm } from './CategoriesForm';

type Props = {
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
  categories?: Array<{ id: string; name: string; description: string | null }>;
  errors?: Record<string, string> | null;
};

export function DetailsForm({ initialValues, formats, categories, errors }: Props) {
  const hasFormats = formats && formats.length > 0;
  const hasCategories = categories && categories.length > 0;

  return (
    <div className="space-y-10">
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
        rows={8}
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

      {hasFormats && <FormatsForm formats={formats} initialValues={initialValues?.formats?.map(({ id }) => id)} />}

      {hasCategories && (
        <CategoriesForm categories={categories} initialValues={initialValues?.categories?.map(({ id }) => id)} />
      )}

      <MarkdownTextArea
        name="references"
        label="References"
        description="Give more info about your talk: slides, workshop pre-requities, github repo, video, summary, steps of the talk, which conference or meetup where it has been already given?"
        rows={4}
        defaultValue={initialValues?.references ?? ''}
        error={errors?.references}
      />
    </div>
  );
}
