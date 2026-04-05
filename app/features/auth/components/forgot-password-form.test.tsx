import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { authClient } from '~/shared/better-auth/auth-client.ts';
import { ForgotPasswordForm } from './forgot-password-form.tsx';

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: () => null,
}));

vi.mock('~/shared/better-auth/auth-client.ts', () => ({
  authClient: { requestPasswordReset: vi.fn() },
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
      path: '/auth/forgot-password',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <ForgotPasswordForm {...defaultProps} {...props} />
        </I18nextProvider>
      ),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/auth/forgot-password']} />);
};

describe('ForgotPasswordForm', () => {
  it('renders email field and submit button', async () => {
    await renderComponent();

    await expect.element(page.getByLabelText('Email address')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Send reset password email' })).toBeVisible();
  });

  it('pre-fills email when defaultEmail is provided', async () => {
    await renderComponent({ defaultEmail: 'user@example.com' });

    await expect.element(page.getByLabelText('Email address')).toHaveValue('user@example.com');
  });

  it('calls authClient.requestPasswordReset and onSuccess on success', async () => {
    vi.mocked(authClient.requestPasswordReset).mockImplementation(async (_data, options) => {
      options?.onRequest?.({} as any);
      options?.onSuccess?.({} as any);
    });

    await renderComponent();

    await page.getByLabelText('Email address').fill('user@example.com');
    await page.getByRole('button', { name: 'Send reset password email' }).click();

    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(authClient.requestPasswordReset).toHaveBeenCalledWith(
      { email: 'user@example.com', redirectTo: '/auth/reset-password' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('displays an error message on failure', async () => {
    vi.mocked(authClient.requestPasswordReset).mockImplementation(async (_data, options) => {
      options?.onRequest?.({} as any);
      options?.onError?.({ error: { code: 'INVALID_EMAIL' } } as any);
    });

    await renderComponent();

    await page.getByLabelText('Email address').fill('user@example.com');
    await page.getByRole('button', { name: 'Send reset password email' }).click();

    await expect.element(page.getByRole('alert')).toBeVisible();
  });
});
