import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { authClient } from '~/shared/better-auth/auth-client.ts';
import { SigninForm } from './signin-form.tsx';

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

vi.mock('~/shared/better-auth/auth-client.ts', () => ({
  authClient: { signIn: { email: vi.fn() } },
  getAuthError: vi.fn((error: { code?: string }) => `error.auth.${error.code}` as any),
}));

vi.mock('~/shared/nonce/use-nonce.ts', () => ({
  useNonce: () => '',
}));

const defaultProps = {
  defaultEmail: '',
  captchaSiteKey: undefined,
  forgotPasswordPath: '/auth/forgot-password',
  onSuccess: vi.fn(),
  onEmailNotVerified: vi.fn(),
};

const renderComponent = (props = {}) => {
  const RouteStub = createRoutesStub([
    {
      path: '/auth/login',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <SigninForm {...defaultProps} {...props} />
        </I18nextProvider>
      ),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/auth/login']} />);
};

describe('SigninForm', () => {
  it('renders email and password fields with sign-in button', async () => {
    await renderComponent();

    await expect.element(page.getByLabelText('Email address')).toBeVisible();
    await expect.element(page.getByLabelText('Password')).toBeVisible();
    await expect.element(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });

  it('pre-fills email when defaultEmail is provided', async () => {
    await renderComponent({ defaultEmail: 'user@example.com' });

    await expect.element(page.getByLabelText('Email address')).toHaveValue('user@example.com');
  });

  it('requires email and password fields', async () => {
    await renderComponent();

    await expect.element(page.getByLabelText('Email address')).toHaveAttribute('required');
    await expect.element(page.getByLabelText('Password')).toHaveAttribute('required');
  });

  it('calls authClient.signIn.email and onSuccess on successful sign-in', async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(async (_creds, options) => {
      options?.onRequest?.({} as any);
      options?.onSuccess?.({} as any);
    });

    await renderComponent();

    await page.getByLabelText('Email address').fill('user@example.com');
    await page.getByLabelText('Password').fill('secret');
    await page.getByRole('button', { name: 'Sign in' }).click();

    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(authClient.signIn.email).toHaveBeenCalledWith(
      { email: 'user@example.com', password: 'secret' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('calls onEmailNotVerified when email is not verified', async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(async (_creds, options) => {
      options?.onRequest?.({} as any);
      await options?.onError?.({ error: { code: 'EMAIL_NOT_VERIFIED' } } as any);
    });

    await renderComponent();

    await page.getByLabelText('Email address').fill('user@example.com');
    await page.getByLabelText('Password').fill('secret');
    await page.getByRole('button', { name: 'Sign in' }).click();

    expect(defaultProps.onEmailNotVerified).toHaveBeenCalled();
  });

  it('displays an error message on sign-in failure', async () => {
    vi.mocked(authClient.signIn.email).mockImplementation(async (_creds, options) => {
      options?.onRequest?.({} as any);
      await options?.onError?.({ error: { code: 'INVALID_EMAIL_OR_PASSWORD' } } as any);
    });

    await renderComponent();

    await page.getByLabelText('Email address').fill('user@example.com');
    await page.getByLabelText('Password').fill('wrong');
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect.element(page.getByRole('alert')).toBeVisible();
  });
});
