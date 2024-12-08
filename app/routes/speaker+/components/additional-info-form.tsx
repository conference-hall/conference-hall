import { Form } from 'react-router';

import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Subtitle } from '~/design-system/typography.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';

type Props = {
  company: string | null;
  location: string | null;
  socials: { github: string | null; twitter: string | null };
  errors: SubmissionErrors;
};

export function AdditionalInfoForm({ company, location, socials, errors }: Props) {
  const { github, twitter } = socials;

  return (
    <Card as="section">
      <Form method="POST" aria-labelledby="additional-info" preventScrollReset>
        <Card.Title>
          <H2 id="additional-info" className="scroll-mt-12">
            Additional information
          </H2>
          <Subtitle>Helps organizers to know more about you.</Subtitle>
        </Card.Title>

        <Card.Content>
          <Input name="company" label="Company" defaultValue={company || ''} error={errors?.company} />
          <Input
            name="location"
            label="Location (city, country)"
            defaultValue={location || ''}
            error={errors?.location}
          />
          <Input
            name="twitter"
            label="Twitter"
            addon="https://twitter.com/"
            defaultValue={twitter || ''}
            error={errors?.twitter}
          />
          <Input
            name="github"
            label="GitHub"
            addon="https://github.com/"
            defaultValue={github || ''}
            error={errors?.github}
          />
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="additional-info">
            Save
          </Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
