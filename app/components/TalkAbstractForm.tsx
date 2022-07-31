import { Input } from '~/design-system/forms/Input';
import { Radio, RadioGroup } from '~/design-system/forms/RadioGroup';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import { LEVELS } from '../utils/levels';
import LanguagesSelect from '../design-system/forms/LanguagesSelect';

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
        id="title"
        name="title"
        type="text"
        label="Title"
        defaultValue={initialValues?.title}
        error={errors?.title?.[0]}
      />
      <MarkdownTextArea
        id="abstract"
        name="abstract"
        label="Abstract"
        description="Brief description of the talk. Markdown is supported "
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
      <LanguagesSelect values={initialValues?.languages ?? []} />
      <MarkdownTextArea
        label="References"
        description="Give more info about your talk: slides, workshop pre-requities, github repo, video, summary, steps of the talk, which conference or meetup where it has been already given?"
        name="references"
        rows={4}
        defaultValue={initialValues?.references ?? ''}
        error={errors?.references?.[0]}
      />
    </div>
  );
}
