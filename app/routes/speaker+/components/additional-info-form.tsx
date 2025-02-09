import { Form } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import { getSocialIcon } from '~/design-system/social-link.tsx';
import { H2, Label, Subtitle } from '~/design-system/typography.tsx';
import { extractSocialProfile } from '~/libs/formatters/social-links.ts';
import type { SubmissionErrors } from '~/types/errors.types.ts';

type Props = {
  company: string | null;
  location: string | null;
  socialLinks: Array<string>;
  errors: SubmissionErrors;
};

const MAX_SOCIAL_LINKS = 4;

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
            {Array(MAX_SOCIAL_LINKS)
              .fill('')
              .map((_, index) => {
                const { name, url } = extractSocialProfile(socialLinks[index]);
                return (
                  <Input
                    key={`${index}:${url}`}
                    name={`socialLinks[${index}]`}
                    aria-label={`Social link ${index + 1}`}
                    placeholder="Link to social profile"
                    defaultValue={url || ''}
                    icon={getSocialIcon(name)}
                    error={errors?.[`socialLinks[${index}]`]}
                  />
                );
              })}
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
