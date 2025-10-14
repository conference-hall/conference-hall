import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import { UserProvider } from '~/app-platform/components/user-context.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { ConversationDrawer } from './conversation-drawer.tsx';

describe('ConversationDrawer component', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    picture: null,
    notificationsUnreadCount: 0,
    hasTeamAccess: true,
    teams: [],
  };

  const messages: Array<Message> = [
    {
      id: 'msg-1',
      sender: { userId: 'user-1', name: 'John Doe', picture: null, role: 'SPEAKER' },
      content: 'First message',
      reactions: [],
      sentAt: new Date('2023-01-01T10:00:00Z'),
    },
    {
      id: 'msg-2',
      sender: { userId: 'user-2', name: 'Jane Doe', picture: null, role: 'ORGANIZER' },
      content: 'Second message',
      reactions: [],
      sentAt: new Date('2023-01-01T11:00:00Z'),
    },
  ];

  const renderComponent = (props = {}, user = mockUser) => {
    const RouteStub = createRoutesStub([
      {
        path: '/',
        action: async () => null,
        Component: () => (
          <UserProvider user={user}>
            <I18nextProvider i18n={i18nTest}>
              <ConversationDrawer messages={[]} {...props}>
                <span>Open Conversation</span>
              </ConversationDrawer>
            </I18nextProvider>
          </UserProvider>
        ),
      },
    ]);
    return render(<RouteStub initialEntries={['/']} />);
  };

  it('opens drawer when clicking trigger button', async () => {
    const screen = renderComponent({ messages });

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText('First message')).toBeInTheDocument();
    await expect.element(screen.getByText('Second message')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('displays empty state when no messages', async () => {
    const screen = renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText('Start a conversation')).toBeInTheDocument();
  });

  it('displays recipients in empty state when provided', async () => {
    const screen = renderComponent({ recipients: ['Alice', 'Bob'] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText(/Start a conversation with/)).toBeInTheDocument();
  });
});
