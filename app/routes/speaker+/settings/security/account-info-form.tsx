import { Form } from 'react-router';
import { Avatar } from '~/design-system/avatar.tsx';
import { Button } from '~/design-system/buttons.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Card } from '~/design-system/layouts/card.tsx';
import {} from '~/design-system/typography.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';

type Props = { name: string | null; email: string | null; picture: string | null; errors: SubmissionErrors };

export function AccountInfoForm({ name, email, picture, errors }: Props) {
  return (
    <Card as="section">
      <Form method="POST" preventScrollReset>
        <Card.Content>
          <Input name="name" label="Full name" defaultValue={name || ''} key={name} error={errors?.name} />
          <Input name="email" label="Email address" defaultValue={email || ''} key={email} error={errors?.email} />

          <div className="flex justify-between gap-8">
            <Input
              name="picture"
              label="Avatar picture URL"
              defaultValue={picture || ''}
              key={picture}
              error={errors?.picture}
              className="flex-1"
            />
            <Avatar picture={picture} name={name} size="xl" square />
          </div>
        </Card.Content>

        <Card.Actions>
          <Button type="submit" name="intent" value="account-info">
            Update account
          </Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
