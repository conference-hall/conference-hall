import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import { authClient } from '~/shared/better-auth/auth-client.ts';
import { ResetPasswordForm } from './reset-password-form.tsx';

vi.mock('~/shared/better-auth/auth-client.ts', () => ({
  authClient: { resetPassword: vi.fn() },
  getAuthError: vi.fn((error: { code?: string }) => `error.auth.${error.code}` as any),
}));

const defaultProps = {
  token: 'valid-token',
  defaultError: null,
  onSuccess: vi.fn(),
};

const renderComponent = (props = {}) => {
  const RouteStub = createRoutesStub([
    {
      path: '/auth/reset-password',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <ResetPasswordForm {...defaultProps} {...props} />
        </I18nextProvider>
      ),
    },
  ]);
  return page.render(<RouteStub initialEntries={['/auth/reset-password']} />);
};

describe('ResetPasswordForm', () => {
  it('renders password field and submit button', async () => {
    await renderComponent();

    await expect.element(page.getByLabelText('Password')).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Change your password' })).toBeVisible();
  });

  it('disables form when token is null', async () => {
    await renderComponent({ token: null });

    await expect.element(page.getByLabelText('Password')).toHaveAttribute('disabled');
    await expect.element(page.getByRole('button', { name: 'Change your password' })).toHaveAttribute('disabled');
  });

  it('shows a default error from URL', async () => {
    await renderComponent({ defaultError: 'error.auth.INVALID_TOKEN' });

    await expect.element(page.getByRole('alert')).toBeVisible();
  });

  it('shows validation errors for weak password', async () => {
    await renderComponent();

    await page.getByLabelText('Password').fill('short');
    await page.getByRole('button', { name: 'Change your password' }).click();

    await expect.element(page.getByText('Minimum 8 characters.')).toBeVisible();
    expect(authClient.resetPassword).not.toHaveBeenCalled();
  });

  it('calls authClient.resetPassword and onSuccess on success', async () => {
    vi.mocked(authClient.resetPassword).mockImplementation(async (_data, options) => {
      options?.onRequest?.({} as any);
      options?.onSuccess?.({} as any);
    });

    await renderComponent();

    await page.getByLabelText('Password').fill('Password1');
    await page.getByRole('button', { name: 'Change your password' }).click();

    expect(defaultProps.onSuccess).toHaveBeenCalled();
    expect(authClient.resetPassword).toHaveBeenCalledWith(
      { newPassword: 'Password1', token: 'valid-token' },
      expect.objectContaining({ onSuccess: expect.any(Function) }),
    );
  });

  it('displays an error message on failure', async () => {
    vi.mocked(authClient.resetPassword).mockImplementation(async (_data, options) => {
      options?.onRequest?.({} as any);
      options?.onError?.({ error: { code: 'INVALID_TOKEN' } } as any);
    });

    await renderComponent();

    await page.getByLabelText('Password').fill('Password1');
    await page.getByRole('button', { name: 'Change your password' }).click();

    await expect.element(page.getByRole('alert')).toBeVisible();
  });
});
