import * as Firebase from 'firebase/auth';
import { useState } from 'react';
import { useFetcher } from 'react-router';
import { Button } from '~/design-system/buttons.tsx';
import { Callout } from '~/design-system/callout.tsx';
import { Input } from '~/design-system/forms/input.tsx';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { Link } from '~/design-system/links.tsx';
import { Label } from '~/design-system/typography.tsx';
import { getClientAuth } from '~/libs/auth/firebase.ts';

type EmailPasswordSigninProps = { redirectTo: string; defaultEmail: string | null };

export function EmailPasswordSignin({ redirectTo, defaultEmail }: EmailPasswordSigninProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [email, setEmail] = useState(defaultEmail || '');
  const [password, setPassword] = useState('');

  const fetcher = useFetcher();

  const loading = submitting || fetcher.state !== 'idle';

  const signIn = async () => {
    if (loading) return;
    try {
      setError('');
      setSubmitting(true);
      const credentials = await Firebase.signInWithEmailAndPassword(getClientAuth(), email, password);
      const token = await credentials.user.getIdToken();
      await fetcher.submit({ token, redirectTo }, { method: 'POST', action: '/auth/login' });
    } catch (error: any) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <fetcher.Form className="space-y-4" onSubmit={signIn}>
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
        <div className="flex justify-between mb-1">
          <Label htmlFor="password">Password</Label>
          <Link
            to={{ pathname: '/auth/forgot-password', search: email ? `?email=${email}` : undefined }}
            weight="semibold"
          >
            Forgot password?
          </Link>
        </div>
        <Input
          name="password"
          placeholder="••••••••"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" variant="primary" disabled={loading} className="w-full mt-2">
        {loading ? <LoadingIcon className="size-4" /> : 'Sign in'}
      </Button>

      {error ? <Callout variant="error">{error}</Callout> : null}
    </fetcher.Form>
  );
}
