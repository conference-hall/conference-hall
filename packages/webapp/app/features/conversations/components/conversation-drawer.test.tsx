import type { Message } from '@conference-hall/shared/types/conversation.types.ts';
import { I18nextProvider } from 'react-i18next';
import { createRoutesStub } from 'react-router';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { UserProvider } from '~/app-platform/components/user-context.tsx';
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
              <ConversationDrawer messages={[]} canManageConversations={false} {...props}>
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
    const screen = await renderComponent({ messages });

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText('First message')).toBeInTheDocument();
    await expect.element(screen.getByText('Second message')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument();
  });

  it('displays empty state when no messages', async () => {
    const screen = await renderComponent();

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText('Start a conversation')).toBeInTheDocument();
  });

  it('displays recipients in empty state when provided', async () => {
    const screen = await renderComponent({ recipients: ['Alice', 'Bob'] });

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText(/Start a conversation with/)).toBeInTheDocument();
  });

  it('hides action menu for other users messages when canManageConversations is false', async () => {
    const otherUserMessage: Message = {
      id: 'msg-1',
      sender: { userId: 'user-2', name: 'Jane Doe', picture: null, role: 'ORGANIZER' },
      content: 'Message from another user',
      reactions: [],
      sentAt: new Date('2023-01-01T10:00:00Z'),
    };
    const screen = await renderComponent({ messages: [otherUserMessage], canManageConversations: false });

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText('Message from another user')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Message action menu' })).not.toBeInTheDocument();
  });

  it('shows action menu for other users messages when canManageConversations is true', async () => {
    const otherUserMessage: Message = {
      id: 'msg-1',
      sender: { userId: 'user-2', name: 'Jane Doe', picture: null, role: 'ORGANIZER' },
      content: 'Message from another user',
      reactions: [],
      sentAt: new Date('2023-01-01T10:00:00Z'),
    };
    const screen = await renderComponent({ messages: [otherUserMessage], canManageConversations: true });

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText('Message from another user')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Message action menu' })).toBeInTheDocument();
  });

  it('shows action menu for own messages regardless of canManageConversations', async () => {
    const ownMessage: Message = {
      id: 'msg-1',
      sender: { userId: 'user-1', name: 'John Doe', picture: null, role: 'SPEAKER' },
      content: 'My own message',
      reactions: [],
      sentAt: new Date('2023-01-01T10:00:00Z'),
    };
    const screen = await renderComponent({ messages: [ownMessage], canManageConversations: false });

    await userEvent.click(screen.getByRole('button', { name: 'Open Conversation' }));

    await expect.element(screen.getByText('My own message')).toBeInTheDocument();
    await expect.element(screen.getByRole('button', { name: 'Message action menu' })).toBeInTheDocument();
  });
});
