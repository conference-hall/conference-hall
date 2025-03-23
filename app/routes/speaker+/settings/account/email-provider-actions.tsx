import { CheckIcon } from '@heroicons/react/16/solid';
import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { type FormEvent, useState } from 'react';
import { Form, useSubmit } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { validateEmailAndPassword } from '~/libs/validators/auth.ts';
import { PasswordInput } from '~/routes/auth+/components/password-input.tsx';
import type { SubmissionErrors } from '~/types/errors.types.ts';

export function NewEmailProviderModal() {
  const submit = useSubmit();
  const [open, setOpen] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<SubmissionErrors>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const linkAccount = async (event: FormEvent) => {
    event.preventDefault();

    const fieldErrors = validateEmailAndPassword(email, password);
    if (fieldErrors) return setFieldErrors(fieldErrors);

    await submit({ intent: 'link-email-provider', email, password }, { method: 'POST' });
  };

  return (
    <>
      <Button type="button" variant="secondary" size="s" onClick={() => setOpen(true)}>
        Link account
      </Button>

      <Modal title="Link with email & password" onClose={() => setOpen(false)} open={open}>
        <Modal.Content className="space-y-6">
          <Subtitle>Link your account with an email and password to enable password-based authentication.</Subtitle>
          <Form id="new-email-provider" onSubmit={linkAccount} className="space-y-4">
            <Input
              label="Email address"
              placeholder="example@site.com"
              name="new-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors?.email}
              required
            />
            <PasswordInput value={password} onChange={setPassword} isNewPassword error={fieldErrors?.password} />
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" form="new-email-provider">
            Link account
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
}

export function VerifyEmailButton() {
  const [sent, setSent] = useState(false);
  const submit = useSubmit();

  const sendVerificationEmail = async () => {
    await submit({ intent: 'verify-email' }, { method: 'POST', navigate: false });
    setSent(true);
  };

  if (sent) {
    return (
      <Button type="button" variant="secondary" size="s" iconLeft={CheckIcon} disabled>
        Email sent
      </Button>
    );
  }
  return (
    <Button type="button" variant="secondary" size="s" iconLeft={CheckBadgeIcon} onClick={sendVerificationEmail}>
      Send verification email
    </Button>
  );
}
