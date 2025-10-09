import type { JSX } from 'react';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import type { Message } from '~/shared/types/conversation.types.ts';
import { ConversationDrawer } from './conversation-drawer.tsx';

describe('ConversationDrawer component', () => {
  const renderComponent = (Component: JSX.Element) => {
    const RouteStub = createRoutesStub([{ path: '/', Component: () => Component }]);
    return render(<RouteStub initialEntries={['/']} />);
  };

  const createMessage = (id: string, content: string, role: 'SPEAKER' | 'ORGANIZER', name: string): Message => ({
    id,
    sender: { userId: `user-${id}`, name, picture: null, role },
    content,
    reactions: [],
    sentAt: new Date('2023-01-15T10:00:00Z'),
  });

  it('displays empty state when no messages and no recipients', async () => {
    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <ConversationDrawer messages={[]}>
          <span>Chat</span>
        </ConversationDrawer>
      </I18nextProvider>,
    );

    await screen.getByRole('button', { name: 'Chat' }).click();

    await expect.element(screen.getByText('Start a conversation')).toBeInTheDocument();
  });

  it('displays empty state with recipients when no messages but recipients provided', async () => {
    const recipients = ['Alice', 'Bob'];

    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <ConversationDrawer messages={[]} recipients={recipients}>
          <span>Chat</span>
        </ConversationDrawer>
      </I18nextProvider>,
    );

    await screen.getByRole('button', { name: 'Chat' }).click();

    const emptyState = screen.getByText(/Start a conversation with/);
    await expect.element(emptyState).toBeInTheDocument();
  });

  it('displays all messages in order when drawer is opened', async () => {
    const messages: Array<Message> = [
      createMessage('1', 'First message', 'SPEAKER', 'Alice'),
      createMessage('2', 'Second message', 'ORGANIZER', 'Bob'),
      createMessage('3', 'Third message', 'SPEAKER', 'Charlie'),
    ];

    const screen = renderComponent(
      <I18nextProvider i18n={i18nTest}>
        <ConversationDrawer messages={messages}>
          <span>Open</span>
        </ConversationDrawer>
      </I18nextProvider>,
    );

    await screen.getByRole('button', { name: 'Open' }).click();

    await expect.element(screen.getByRole('heading', { name: 'Conversation' })).toBeInTheDocument();

    await expect.element(screen.getByText('First message')).toBeInTheDocument();
    await expect.element(screen.getByText('Second message')).toBeInTheDocument();
    await expect.element(screen.getByText('Third message')).toBeInTheDocument();
    await expect.element(screen.getByText('Alice')).toBeInTheDocument();
    await expect.element(screen.getByText('Bob')).toBeInTheDocument();
    await expect.element(screen.getByText('Charlie')).toBeInTheDocument();
  });
});
