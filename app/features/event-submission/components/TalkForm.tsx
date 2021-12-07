import { Heading } from '../../../components/Heading';
import { Input } from '../../../components/forms/Input';
import { CategoriesForm } from './CategoriesForm';
import { FormatsForm } from './FormatsForm';
import { TextArea } from '../../../components/forms/TextArea';
import { Radio, RadioGroup } from '../../../components/forms/RadioGroup';

const LEVELS = [
  { key: 'BEGINNER', label: 'Beginner' },
  { key: 'INTERMEDIATE', label: 'Intermediate' },
  { key: 'ADVANCED', label: 'Advanced' },
];

type TalkFormProps = {
  initialValues?: {
    title: string;
    abstract: string;
    references: string | null;
    level: string | null;
  };
  errors?: {
    [field: string]: string[];
  };
  formats: Array<{ id: string; name: string; description: string | null }>;
  categories: Array<{ id: string; name: string; description: string | null }>;
};

export function TalkForm({ initialValues, errors, formats, categories }: TalkFormProps) {
  return (
    <>
      <div className="px-8 py-6 sm:px-8 lg:w-8/12">
        <Heading description="This information will be displayed publicly so be careful what you share.">
          Your proposal
        </Heading>
        <Input
          type="text"
          label="Title"
          name="title"
          className="mt-6"
          defaultValue={initialValues?.title}
          error={errors?.title?.[0]}
        />
        <TextArea
          label="Abstract"
          description="Brief description of the talk. Markdown is supported "
          name="abstract"
          className="mt-6"
          rows={4}
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
        <TextArea
          label="References"
          description="Give more info about your talk: slides, workshop pre-requities, github repo, video, summary, steps of the talk, which conference or meetup where it has been already given?"
          name="references"
          className="mt-6"
          rows={4}
          defaultValue={initialValues?.references ?? ''}
          error={errors?.references?.[0]}
        />
      </div>
      {formats?.length > 0 ? (
        <div className="px-8 py-3 sm:px-8 lg:w-8/12">
          <FormatsForm formats={formats} />
        </div>
      ) : null}
      {categories?.length > 0 ? (
        <div className="px-8 py-3 sm:px-8 lg:w-8/12">
          <CategoriesForm categories={categories} />
        </div>
      ) : null}
    </>
  );
}
