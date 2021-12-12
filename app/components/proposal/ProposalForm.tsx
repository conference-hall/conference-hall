import { Input } from '~/components/forms/Input';
import { Radio, RadioGroup } from '~/components/forms/RadioGroup';
import { MarkdownTextArea } from '~/components/forms/MarkdownTextArea';

const LEVELS = [
  { key: 'BEGINNER', label: 'Beginner' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

type ProposalFormProps = {
  initialValues?: {
    title: string;
    abstract: string;
    references: string | null;
    level: string | null;
  } | null;
  errors?: {
    [field: string]: string[];
  };
};

export function ProposalForm({ initialValues, errors }: ProposalFormProps) {
  return (
    <>
      <Input
        type="text"
        label="Title"
        name="title"
        defaultValue={initialValues?.title}
        error={errors?.title?.[0]}
      />
      <MarkdownTextArea
        label="Abstract"
        description="Brief description of the talk. Markdown is supported "
        name="abstract"
        className="mt-6"
        rows={8}
        defaultValue={initialValues?.abstract}
        error={errors?.abstract?.[0]}
      />
      <RadioGroup label="Level" inline className="mt-6">
        {LEVELS.map(({ key, label }) => (
          <Radio name="level" key={key} id={key} value={key} defaultChecked={initialValues?.level === key}>
            {label}
          </Radio>
        ))}
      </RadioGroup>
      <MarkdownTextArea
        label="References"
        description="Give more info about your talk: slides, workshop pre-requities, github repo, video, summary, steps of the talk, which conference or meetup where it has been already given?"
        name="references"
        className="mt-6"
        rows={4}
        defaultValue={initialValues?.references ?? ''}
        error={errors?.references?.[0]}
      />
    </>
  );
}
