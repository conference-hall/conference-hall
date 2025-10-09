import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import type { Message } from '~/shared/types/conversation.types.ts';
import { MessageBlock } from './message-block.tsx';

describe('MessageBlock component', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const renderComponent = (message: Message) => {
    return render(
      <I18nextProvider i18n={i18nTest}>
        <MessageBlock message={message} />
      </I18nextProvider>,
    );
  };

  it('displays speaker message with name, content, role badge and time', async () => {
    const message: Message = {
      id: 'msg-1',
      sender: {
        userId: 'user-1',
        name: 'John Doe',
        picture: null,
        role: 'SPEAKER',
      },
      content: 'Hello, I have a question about my proposal.',
      reactions: [],
      sentAt: new Date('2023-01-15T10:00:00Z'),
    };

    const screen = renderComponent(message);

    await expect.element(screen.getByText('John Doe')).toBeInTheDocument();
    await expect.element(screen.getByText('Hello, I have a question about my proposal.')).toBeInTheDocument();
    await expect.element(screen.getByText('SPEAKER')).toBeInTheDocument();
    await expect.element(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('formats relative time correctly for different time ranges', async () => {
    const messageJustSent: Message = {
      id: 'msg-6',
      sender: {
        userId: 'user-6',
        name: 'Recent User',
        picture: null,
        role: 'SPEAKER',
      },
      content: 'Just sent',
      reactions: [],
      sentAt: new Date('2023-01-15T11:59:00Z'),
    };

    const messageWeekAgo: Message = {
      id: 'msg-7',
      sender: {
        userId: 'user-7',
        name: 'Old User',
        picture: null,
        role: 'ORGANIZER',
      },
      content: 'Sent a week ago',
      reactions: [],
      sentAt: new Date('2023-01-08T12:00:00Z'),
    };

    const screenRecent = renderComponent(messageJustSent);
    await expect.element(screenRecent.getByText('1 minute ago')).toBeInTheDocument();

    const screenOld = renderComponent(messageWeekAgo);
    await expect.element(screenOld.getByText('7 days ago')).toBeInTheDocument();
  });
});
