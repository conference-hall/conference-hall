import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { MessageInputForm } from './message-input-form.tsx';

describe('MessageInputForm component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/']} />);
  };

  it('displays textarea with label, placeholder and submit button', async () => {
    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <MessageInputForm
          name="message"
          intent="add-message"
          inputLabel="Type your message"
          buttonLabel="Send"
          placeholder="Enter your message here..."
        />
      </I18nextProvider>,
    );

    const textarea = screen.getByRole('textbox', { name: 'Type your message' });
    await expect.element(textarea).toBeInTheDocument();
    await expect.element(textarea).toHaveAttribute('placeholder', 'Enter your message here...');
    await expect.element(textarea).toHaveAttribute('name', 'message');
    await expect.element(textarea).toBeRequired();

    const submitButton = screen.getByRole('button', { name: 'Send' });
    await expect.element(submitButton).toBeInTheDocument();
    await expect.element(submitButton).toHaveAttribute('type', 'submit');
  });

  it('includes hidden intent field with correct value', async () => {
    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <MessageInputForm
          name="comment"
          intent="add-comment"
          inputLabel="Add comment"
          buttonLabel="Post"
          placeholder="Write a comment..."
        />
      </I18nextProvider>,
    );

    const intentInput = screen.container.querySelector('input[name="intent"]');
    expect(intentInput).toBeTruthy();
    expect(intentInput?.getAttribute('value')).toBe('add-comment');
    expect(intentInput?.getAttribute('type')).toBe('hidden');
  });
});
