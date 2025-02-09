import { LinkIcon } from '@heroicons/react/20/solid';
import { Form } from 'react-router';

import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { H2, Label, Subtitle } from '~/design-system/typography.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';

type Props = {
  company: string | null;
  location: string | null;
  socialLinks: Array<string>;
  errors: SubmissionErrors;
};

export function AdditionalInfoForm({ company, location, socialLinks, errors }: Props) {
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
          <div className="flex flex-col gap-2">
            <Label>Social links</Label>
            <Input
              name="socialLinks[0]"
              aria-label="Social link 1"
              placeholder="Link to social profile"
              defaultValue={socialLinks[0] || ''}
              icon={LinkIcon}
              error={errors?.['socialLinks[0]']}
            />
            <Input
              name="socialLinks[1]"
              aria-label="Social link 2"
              placeholder="Link to social profile"
              defaultValue={socialLinks[1] || ''}
              icon={LinkIcon}
              error={errors?.['socialLinks[1]']}
            />
            <Input
              name="socialLinks[2]"
              aria-label="Social link 3"
              placeholder="Link to social profile"
              defaultValue={socialLinks[2] || ''}
              icon={LinkIcon}
              error={errors?.['socialLinks[2]']}
            />
            <Input
              name="socialLinks[3]"
              aria-label="Social link 4"
              placeholder="Link to social profile"
              defaultValue={socialLinks[3] || ''}
              icon={LinkIcon}
              error={errors?.['socialLinks[3]']}
            />
          </div>
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
