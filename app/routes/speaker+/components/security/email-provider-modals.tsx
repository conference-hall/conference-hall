import * as Firebase from 'firebase/auth';
import { type FormEvent, useState } from 'react';
import { useFetcher } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Modal } from '~/design-system/dialogs/modals.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { Subtitle } from '~/design-system/typography.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { PasswordInput } from '~/routes/auth+/components/password-input.tsx';

export function NewEmailProviderModal() {
  const fetcher = useFetcher();
  const [error, setError] = useState<string>('');
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const linkAccount = async (event: FormEvent) => {
    event.preventDefault();
    const { currentUser } = getClientAuth();
    if (!currentUser) return;
    // TODO: Validate email and password with zod
    const credential = Firebase.EmailAuthProvider.credential(email, password);
    try {
      const credentials = await Firebase.linkWithCredential(currentUser, credential);
      const token = await credentials.user.getIdToken(true);
      await fetcher.submit(
        { token, redirectTo: '/speaker/profile/security' },
        { method: 'POST', action: '/auth/login' },
      );
    } catch (error: any) {
      setError(error.code); // TODO: Show error message
    }
  };

  return (
    <>
      <Button type="button" variant="secondary" size="s" onClick={() => setOpen(true)}>
        Link account
      </Button>

      <Modal title="Link email & password" onClose={() => setOpen(false)} open={open}>
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
