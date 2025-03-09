import * as Firebase from 'firebase/auth';
import { useState } from 'react';
import { useFetcher } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';

type EmailPasswordSignupProps = { redirectTo: string };

export function EmailPasswordSignup({ redirectTo }: EmailPasswordSignupProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');

  const fetcher = useFetcher();

  const loading = submitting || fetcher.state !== 'idle';

  const signUp = async () => {
    if (loading) return;
    try {
      setSubmitting(true);
      const clientAuth = getClientAuth();
      const credentials = await Firebase.createUserWithEmailAndPassword(clientAuth, email, password);
      await Firebase.updateProfile(credentials.user, { displayName: name });
      const token = await credentials.user.getIdToken(true);
      await fetcher.submit({ token, redirectTo }, { method: 'POST', action: '/auth/login' });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <fetcher.Form className="space-y-4" onSubmit={signUp}>
      <Input
        label="Full name"
        placeholder="John Doe"
        name="name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <Input
        label="Email address"
        placeholder="example@site.com"
        name="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <div>
        <Input
          label="Password"
          placeholder="••••••••"
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
        {loading ? <LoadingIcon className="size-4" /> : 'Create your account'}
      </Button>

      {error ? <Callout variant="error">{error}</Callout> : null}
    </fetcher.Form>
  );
}
