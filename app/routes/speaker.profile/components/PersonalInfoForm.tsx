import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { H2, Subtitle } from '~/design-system/Typography';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';

type Props = {
  bio: string | null;
  references: string | null;
  errors?: Record<string, string>;
};

export function PersonalInfoForm({ bio, references, errors }: Props) {
  return (
    <Form method="POST" aria-labelledby="speaker-details-label" preventScrollReset>
      <div className="px-8 pt-8">
        <H2 size="xl" mb={0} id="speaker-details-label">
          Speaker details
        </H2>
        <Subtitle>
          Give more information about you, these information will be visible by organizers when you submit a talk.
        </Subtitle>
        <a id="speaker-details" href="#speaker-details" className="scroll-mt-24" />
      </div>

      <div className="grid grid-cols-1 gap-6 p-8">
        <input type="hidden" name="_type" value="DETAILS" />
        <MarkdownTextArea
          name="bio"
          label="Biography"
          description="Brief description for your profile."
          rows={5}
          error={errors?.bio}
          defaultValue={bio || ''}
        />
        <MarkdownTextArea
          name="references"
          label="Speaker references"
          description="Give some information about your speaker experience: your already-given talks, conferences or meetups as speaker, video links..."
          rows={5}
          error={errors?.references}
          defaultValue={references || ''}
        />
      </div>
      <div className="border-t border-t-gray-200 px-8 py-4 text-right">
        <Button type="submit">Save</Button>
      </div>
    </Form>
  );
}
