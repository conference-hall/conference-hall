import { CheckIcon } from '@heroicons/react/16/solid';
import { CheckBadgeIcon, KeyIcon } from '@heroicons/react/24/outline';
import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { Form, useFetcher, useNavigate, useSubmit } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { PasswordInput } from '~/routes/auth+/components/password-input.tsx';

export function NewEmailProviderModal() {
  const fetcher = useFetcher();
  const [error, setError] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const linkAccount = async (event: FormEvent) => {
    setError('');
    event.preventDefault();
    const { currentUser } = getClientAuth();
    if (!currentUser) return;
    // TODO: Validate email and password with zod
    try {
      const credential = Firebase.EmailAuthProvider.credential(email, password);
      const credentials = await Firebase.linkWithCredential(currentUser, credential);
      const token = await credentials.user.getIdToken(true);
      await fetcher.submit(
        { token, redirectTo: '/speaker/profile/security' },
        { method: 'POST', action: '/auth/login' },
      );
    } catch (error) {
      setError(getFirebaseError(error));
    }
  };

  return (
    <>
      <Button type="button" variant="secondary" size="s" onClick={() => setOpen(true)}>
        Link account
      </Button>

      <Modal title="Link with email & password" onClose={() => setOpen(false)} open={open}>
        <Modal.Content className="space-y-6">
          <Subtitle>Link your account with an email and password to enable password-based authentication.</Subtitle>
          <fetcher.Form id="new-email-provider" onSubmit={linkAccount} className="space-y-4">
            <Input
              label="Email address"
              placeholder="example@site.com"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <PasswordInput value={password} onChange={setPassword} isNewPassword />
            {error && <Callout variant="error">{error}</Callout>}
          </fetcher.Form>
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

type ChangePasswordProps = { email: string };

export function ChangePasswordModal({ email }: ChangePasswordProps) {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const changePassword = async (event: FormEvent) => {
    setError('');
    event.preventDefault();
    const { currentUser } = getClientAuth();
    if (!currentUser) return;
    // TODO: Validate new password with zod
    try {
      const credential = Firebase.EmailAuthProvider.credential(email, currentPassword);
      await Firebase.reauthenticateWithCredential(currentUser, credential);
      await Firebase.updatePassword(currentUser, newPassword);
      await navigate('/auth/login');
    } catch (error) {
      setError(getFirebaseError(error));
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="secondary"
        size="s"
        iconLeft={KeyIcon}
        onClick={() => setOpen(true)}
        className="grow"
      >
        Change password
      </Button>

      <Modal title="Change your password" onClose={() => setOpen(false)} open={open}>
        <Modal.Content className="space-y-6">
          <Subtitle>
            Change the password linked to your account. You will need to verify the new password to complete.
          </Subtitle>
          <Form id="change-password-form" onSubmit={changePassword} className="space-y-4">
            <PasswordInput
              name="currentPassword"
              label="Current password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />
            <PasswordInput
              name="newPassword"
              label="New password"
              value={newPassword}
              onChange={setNewPassword}
              isNewPassword
            />
            {error && <Callout variant="error">{error}</Callout>}
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" form="change-password-form">
            Change password
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
