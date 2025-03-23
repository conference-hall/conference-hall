import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import * as Firebase from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { LoadingIcon } from '~/design-system/icons/loading-icon.tsx';
import { EmptyState } from '~/design-system/layouts/empty-state.tsx';
import { Link } from '~/design-system/links.tsx';
import { getFirebaseError } from '~/libs/auth/firebase.errors.ts';
import { getClientAuth } from '~/libs/auth/firebase.ts';
import { mergeMeta } from '~/libs/meta/merge-meta.ts';
import type { Route } from './+types/verify-email.ts';

export const meta = (args: Route.MetaArgs) => {
  return mergeMeta(args.matches, [{ title: 'Verify email | Conference Hall' }]);
};

export const loader = async () => {
  return null;
};

export default function VerifyEmail() {
  const [error, setError] = useState<string>('Invalid email verification link!');
  const [loading, setLoading] = useState<boolean>(true);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get('oobCode');
  const email = searchParams.get('email');

  useEffect(() => {
    if (!oobCode) return setLoading(false);

    Firebase.applyActionCode(getClientAuth(), oobCode)
      .then(() => {
        toast.success('Email verified. You can now login.');
        navigate({ pathname: '/auth/login', search: `?email=${email}` });
      })
      .catch((error) => {
        setError(getFirebaseError(error));
      })
      .finally(() => {
        setLoading(false);
      });
  }, [oobCode, email, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingIcon className="size-10" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen">
      <EmptyState
        label={error}
        icon={ExclamationCircleIcon}
        className="flex flex-col items-center pt-8 sm:pt-16 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Link to="/auth/login" weight="semibold">
          Go back to login
        </Link>
      </EmptyState>
    </div>
  );
}
