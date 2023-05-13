import { Form } from '@remix-run/react';
import { Button } from '~/design-system/Buttons';
import { H2, Subtitle } from '~/design-system/Typography';
import { MarkdownTextArea } from '~/design-system/forms/MarkdownTextArea';
import { Card } from '~/design-system/layouts/Card';

type Props = {
  bio: string | null;
  references: string | null;
  errors?: Record<string, string | string[]> | null;
};

export function SpeakerDetailsForm({ bio, references, errors }: Props) {
  return (
    <Card as="section">
      <Form method="POST" aria-labelledby="speaker-details-label" preventScrollReset>
        <Card.Title>
          <H2 size="base" id="speaker-details-label">
            Speaker details
          </H2>
          <Subtitle>
            Give more information about you, these information will be visible by organizers when you submit a talk.
          </Subtitle>
          <a id="speaker-details" href="#speaker-details" className="scroll-mt-24" />
        </Card.Title>

        <Card.Content>
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
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="speaker-details">
            Save
          </Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
