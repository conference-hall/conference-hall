import { Input } from '~/design-system/forms/Input';
import { Radio, RadioGroup } from '~/design-system/forms/RadioGroup';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import { LEVELS } from '../utils/levels';
import MultiSelect from '~/design-system/forms/MultiSelect';
import { LANGUAGES } from '~/utils/languages';

type Props = {
  initialValues?: {
    title: string;
    abstract: string;
    references: string | null;
    languages: string[];
    level: string | null;
  } | null;
  errors?: {
    [field: string]: string[];
  };
};

export function TalkAbstractForm({ initialValues, errors }: Props) {
  return (
    <div className="space-y-10">
      <Input
        name="title"
        type="text"
        label="Title"
        required
        defaultValue={initialValues?.title}
        error={errors?.title?.[0]}
      />
      <MarkdownTextArea
        name="abstract"
        label="Abstract"
        description="Brief description of the talk. Markdown is supported "
        required
        rows={8}
        defaultValue={initialValues?.abstract}
        error={errors?.abstract?.[0]}
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
      <MarkdownTextArea
        name="references"
        label="References"
        description="Give more info about your talk: slides, workshop pre-requities, github repo, video, summary, steps of the talk, which conference or meetup where it has been already given?"
        rows={4}
        defaultValue={initialValues?.references ?? ''}
        error={errors?.references?.[0]}
      />
    </div>
  );
}
