import { Heading } from '../../../components/Heading';
import { Input } from '../../../components/forms/Input';
import { CategoriesForm } from './CategoriesForm';
import { FormatsForm } from './FormatsForm';

type TalkFormProps = {
  initialValues?: {
    title: string;
    abstract: string;
    references: string | null;
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
      <div className="px-4 py-5 sm:px-6">
        <Heading description="This information will be displayed publicly so be careful what you share.">
          Your proposal
        </Heading>
        <Input
          type="text"
          label="Title"
          name="title"
          className="mt-4"
          defaultValue={initialValues?.title}
          error={errors?.title?.[0]}
        />
        <Input
          type="text"
          label="Abstract"
          name="abstract"
          className="mt-4"
          defaultValue={initialValues?.abstract}
          error={errors?.abstract?.[0]}
        />
        <Input
          type="text"
          label="References"
          name="references"
          className="mt-4"
          defaultValue={initialValues?.references ?? ''}
          error={errors?.references?.[0]}
        />
      </div>
      {formats?.length > 0 ? (
        <div className="px-4 py-5 sm:px-6">
          <Heading description="Select one or severals formats proposed by the event organizers.">Formats</Heading>
          <FormatsForm formats={formats} />
        </div>
      ) : null}
      {categories?.length > 0 ? (
        <div className="px-4 py-5 sm:px-6">
          <Heading description="Select categories that are the best fit for your proposal.">Categories</Heading>
          <CategoriesForm categories={categories} />
        </div>
      ) : null}
    </>
  );
}
