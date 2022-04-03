import { Input } from '~/components/forms/Input';
import { Radio, RadioGroup } from '~/components/forms/RadioGroup';
import { MarkdownTextArea } from '~/components/forms/MarkdownTextArea';
import { Select } from '../forms/Select';
import languages from '../../utils/languages.json';

const LEVELS = [
  { key: 'BEGINNER', label: 'Beginner' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

const LANGUAGES_OPTIONS = Object.entries(languages).map(([value, label]) => ({ value, label }))

type TalkAbstractProps = {
  initialValues?: {
    title: string;
    abstract: string;
    references: string | null;
    language: string | null;
    level: string | null;
  } | null;
  errors?: {
    [field: string]: string[];
  };
};

export function TalkAbstractForm({ initialValues, errors }: TalkAbstractProps) {
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
      <Select label="Language" id="language" name="language" defaultValue={initialValues?.language || ''} >
        {LANGUAGES_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </Select>
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
