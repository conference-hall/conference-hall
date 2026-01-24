import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { authClient } from '~/shared/better-auth/auth-client.ts';
import { SignupForm } from './signup-form.tsx';

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

vi.mock('~/shared/better-auth/auth-client.ts', () => ({
  authClient: { signUp: { email: vi.fn() } },
  getAuthError: vi.fn((error: { code?: string }) => `error.auth.${error.code}` as any),
}));

vi.mock('~/shared/nonce/use-nonce.ts', () => ({
  useNonce: () => '',
}));

const defaultProps = {
  defaultEmail: '',
  captchaSiteKey: undefined,
  onSuccess: vi.fn(),
};

const renderComponent = (props = {}) => {
  const RouteStub = createRoutesStub([
    {
      path: '/auth/signup',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <SignupForm {...defaultProps} {...props} />
        </I18nextProvider>
      ),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/auth/signup']} />);
};

describe('SignupForm', () => {
  it('renders name, email, password fields with sign-up button', async () => {
    await renderComponent();

    await expect.element(page.getByLabelText('Full name')).toBeVisible();
    await expect.element(page.getByLabelText('Email address')).toBeVisible();
    await expect.element(page.getByLabelText('Password')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Create your account' })).toBeVisible();
  });

  it('pre-fills email when defaultEmail is provided', async () => {
    await renderComponent({ defaultEmail: 'user@example.com' });

    await expect.element(page.getByLabelText('Email address')).toHaveValue('user@example.com');
  });

  it('requires name, email and password fields', async () => {
    await renderComponent();

    await expect.element(page.getByLabelText('Full name')).toHaveAttribute('required');
    await expect.element(page.getByLabelText('Email address')).toHaveAttribute('required');
    await expect.element(page.getByLabelText('Password')).toHaveAttribute('required');
  });

  it('shows validation errors for weak password', async () => {
    await renderComponent();

    await page.getByLabelText('Full name').fill('John Doe');
    await page.getByLabelText('Email address').fill('user@example.com');
    await page.getByLabelText('Password').fill('short');
    await page.getByRole('button', { name: 'Create your account' }).click();

    await expect.element(page.getByText('Minimum 8 characters.')).toBeVisible();
    expect(authClient.signUp.email).not.toHaveBeenCalled();
  });

  it('calls authClient.signUp.email and onSuccess on successful sign-up', async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(async (_creds, options) => {
      options?.onRequest?.({} as any);
      options?.onSuccess?.({} as any);
    });

    await renderComponent();

    await page.getByLabelText('Full name').fill('John Doe');
    await page.getByLabelText('Email address').fill('user@example.com');
    await page.getByLabelText('Password').fill('Password1');
    await page.getByRole('button', { name: 'Create your account' }).click();

    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(authClient.signUp.email).toHaveBeenCalledWith(
      { email: 'user@example.com', password: 'Password1', name: 'John Doe' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('displays an error message on sign-up failure', async () => {
    vi.mocked(authClient.signUp.email).mockImplementation(async (_creds, options) => {
      options?.onRequest?.({} as any);
      options?.onError?.({ error: { code: 'INVALID_EMAIL' } } as any);
    });

    await renderComponent();

    await page.getByLabelText('Full name').fill('John Doe');
    await page.getByLabelText('Email address').fill('user@example.com');
    await page.getByLabelText('Password').fill('Password1');
    await page.getByRole('button', { name: 'Create your account' }).click();

    await expect.element(page.getByRole('alert')).toBeVisible();
  });
});
