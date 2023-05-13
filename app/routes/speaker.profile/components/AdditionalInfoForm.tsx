import { Form } from '@remix-run/react';

import { Button } from '~/design-system/Buttons';
import { Input } from '~/design-system/forms/Input';
import { Card } from '~/design-system/layouts/Card';
import { H2, Subtitle } from '~/design-system/Typography';
import type { UserSocialLinks } from '~/schemas/user';

type Props = {
  company: string | null;
  address: string | null;
  socials: UserSocialLinks;
  errors?: Record<string, string | string[]> | null;
};

export function AdditionalInfoForm({ company, address, socials, errors }: Props) {
  const { github, twitter } = socials;

  return (
    <Card as="section">
      <Form method="POST" aria-labelledby="additional-info-label" preventScrollReset>
        <Card.Title>
          <H2 size="base" id="additional-info-label">
            Additional information
          </H2>
          <Subtitle>Helps organizers to know more about you.</Subtitle>
          <a id="additional-info" href="#additional-info" className="scroll-mt-24" />
        </Card.Title>

        <Card.Content>
          <Input name="company" label="Company" defaultValue={company || ''} error={errors?.company} />
          <Input name="address" label="Location (city, country)" defaultValue={address || ''} error={errors?.address} />
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
