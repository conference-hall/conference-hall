import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { CommentFormEntry } from './comment-form-entry.tsx';

vi.mock('~/app-platform/components/user-context.tsx', () => ({
  useUser: () => ({
    id: '1',
    name: 'John Doe',
    picture: 'https://example.com/avatar.jpg',
    email: 'john@example.com',
  }),
}));

const renderComponent = (props = {}) => {
  const RouteStub = createRoutesStub([
    {
      path: '/',
      Component: () => (
        <I18nextProvider i18n={i18nTest}>
          <CommentFormEntry {...props} />
        </I18nextProvider>
      ),
      action: vi.fn(),
    },
  ]);
  return render(<RouteStub />);
};

describe('CommentFormEntry', () => {
  it('renders with user avatar and textarea', async () => {
    const screen = renderComponent();

    await expect.element(screen.getByRole('img', { name: /john doe/i })).toBeInTheDocument();
    await expect.element(screen.getByRole('textbox')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: /comment/i })).toHaveAttribute('type', 'submit');
  });

  it('submits form on Enter key press', async () => {
    const screen = renderComponent();
    const textarea = screen.getByRole('textbox');
    const form = screen.container.querySelector('form');
    const submitSpy = vi.spyOn(form!, 'requestSubmit');

    await userEvent.type(textarea, 'This is a test comment');
    await expect.element(textarea).toHaveValue('This is a test comment');

    await userEvent.keyboard('{Enter}');
    expect(submitSpy).toHaveBeenCalled();
  });

  it('does not submit form on Shift+Enter key press', async () => {
    const screen = renderComponent();
    const textarea = screen.getByRole('textbox');
    const form = screen.container.querySelector('form');
    const submitSpy = vi.spyOn(form!, 'requestSubmit');

    await userEvent.type(textarea, 'First line');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    await userEvent.type(textarea, 'Second line');

    await expect.element(textarea).toHaveValue('First line\nSecond line');
    expect(submitSpy).not.toHaveBeenCalled();
  });
});
