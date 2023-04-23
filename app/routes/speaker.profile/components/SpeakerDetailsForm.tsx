import { Form, useSubmit } from '@remix-run/react';
import { getAuth } from 'firebase/auth';
import { useCallback } from 'react';
import { Avatar } from '~/design-system/Avatar';
import { Button } from '~/design-system/Buttons';
import { H2, Subtitle } from '~/design-system/Typography';
import { Input } from '~/design-system/forms/Input';
import { Card } from '~/design-system/layouts/Card';

type Props = {
  name: string | null;
  email: string | null;
  photoURL: string | null;
  errors?: Record<string, string>;
};

export function SpeakerDetailsForm({ name, email, photoURL, errors }: Props) {
  const submit = useSubmit();

  const resetCurrentUser = useCallback(() => {
    const { currentUser } = getAuth();
    submit(
      {
        _type: 'INFO',
        name: currentUser?.displayName ?? '',
        email: currentUser?.email ?? '',
        photoURL: currentUser?.photoURL ?? '',
      },
      { method: 'POST' }
    );
  }, [submit]);

  return (
    <Card as="section">
      <Form method="POST" aria-labelledby="personal-info-label" preventScrollReset>
        <Card.Title>
          <H2 size="xl" id="personal-info-label">
            Personal information
          </H2>
          <Subtitle>Use a permanent address where you can receive email.</Subtitle>
          <a id="personal-info" href="#personal-info" className="scroll-mt-24" aria-hidden={true} />
        </Card.Title>

        <Card.Content>
          <input type="hidden" name="_type" value="INFO" />
          <Input name="name" label="Full name" defaultValue={name || ''} key={name} error={errors?.name} />
          <Input name="email" label="Email address" defaultValue={email || ''} key={email} error={errors?.email} />

          <div className="flex justify-between gap-8">
            <Input
              name="photoURL"
              label="Avatar picture URL"
              defaultValue={photoURL || ''}
              key={photoURL}
              error={errors?.photoURL}
              className="flex-1"
            />
            <Avatar photoURL={photoURL} name={name} size="xl" square />
          </div>
        </Card.Content>

        <Card.Actions>
          <Button type="button" onClick={resetCurrentUser} variant="secondary">
            Reset default
          </Button>
          <Button type="submit">Save</Button>
        </Card.Actions>
      </Form>
    </Card>
  );
}
