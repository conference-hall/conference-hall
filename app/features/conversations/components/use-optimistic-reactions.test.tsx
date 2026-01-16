import { useFetcher } from 'react-router';
import { renderHook } from 'vitest-browser-react';
import type { Message } from '~/shared/types/conversation.types.ts';
import { useUser } from '~/app-platform/components/user-context.tsx';
import { useOptimisticReactions } from './use-optimistic-reactions.ts';

vi.mock('react-router', () => ({
  useFetcher: vi.fn(),
}));

vi.mock('~/app-platform/components/user-context.tsx', () => ({
  useUser: vi.fn(),
}));

describe('useOptimisticReactions hook', () => {
  const mockUser = {
    id: 'user-1',
    uid: 'user-uid-1',
    name: 'John Doe',
    email: 'john@example.com',
    picture: null,
    notificationsUnreadCount: 0,
    hasTeamAccess: true,
    teams: [],
  };

  const mockFetcherSubmit = vi.fn();

  let message: Message;

  beforeEach(() => {
    message = {
      id: 'msg-1',
      sender: { userId: 'user-1', name: 'John Doe', picture: null, role: 'SPEAKER' },
      content: 'Test message',
      reactions: [
        {
          code: 'tada',
          reacted: true,
          reactedBy: [{ userId: 'user-1', name: 'John Doe' }],
        },
        {
          code: 'heart',
          reacted: false,
          reactedBy: [{ userId: 'user-2', name: 'Jane Doe' }],
        },
      ],
      sentAt: new Date('2023-01-01T10:00:00Z'),
    };

    vi.mocked(useUser).mockReturnValue(mockUser);
    vi.mocked(useFetcher).mockReturnValue({ submit: mockFetcherSubmit } as never);
  });

  it('returns original reactions', async () => {
    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    expect(result.current.reactions.length).toBe(2);
    expect(result.current.reactions[0].code).toBe('tada');
    expect(result.current.reactions[0].reacted).toBe(true);
    expect(result.current.reactions[1].code).toBe('heart');
    expect(result.current.reactions[1].reacted).toBe(false);
  });

  it('adds new reaction and submits', async () => {
    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    await result.current.onChangeReaction({ code: 'thumbsup', skin: '', name: 'thumbsup' });

    expect(message.reactions.length).toBe(3);
    expect(message.reactions[2].code).toBe('thumbsup');
    expect(message.reactions[2].reacted).toBe(true);
    expect(message.reactions[2].reactedBy.length).toBe(1);
    expect(message.reactions[2].reactedBy[0].userId).toBe('user-1');

    expect(mockFetcherSubmit).toHaveBeenCalledWith(
      { intent: 'react-message', id: 'msg-1', code: 'thumbsup' },
      { method: 'POST' },
    );
  });

  it('increments existing reaction when current user reacts', async () => {
    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    await result.current.onChangeReaction({ code: 'heart', skin: '', name: 'heart' });

    expect(message.reactions.length).toBe(2);
    const heartReaction = message.reactions.find((r) => r.code === 'heart');
    expect(heartReaction?.reacted).toBe(true);
    expect(heartReaction?.reactedBy.length).toBe(2);
    expect(heartReaction?.reactedBy[1].userId).toBe('user-1');

    expect(mockFetcherSubmit).toHaveBeenCalledWith(
      { intent: 'react-message', id: 'msg-1', code: 'heart' },
      { method: 'POST' },
    );
  });

  it('decrements reaction when current user unreacts from multi-user reaction', async () => {
    const messageWithMultipleReactions: Message = {
      ...message,
      reactions: [
        {
          code: 'tada',
          reacted: true,
          reactedBy: [
            { userId: 'user-1', name: 'John Doe' },
            { userId: 'user-2', name: 'Jane Doe' },
          ],
        },
      ],
    };

    const { result } = await renderHook(() => useOptimisticReactions(messageWithMultipleReactions, 'message'));

    await result.current.onChangeReaction({ code: 'tada', skin: '', name: 'tada' });

    expect(messageWithMultipleReactions.reactions.length).toBe(1);
    expect(messageWithMultipleReactions.reactions[0].code).toBe('tada');
    expect(messageWithMultipleReactions.reactions[0].reacted).toBe(false);
    expect(messageWithMultipleReactions.reactions[0].reactedBy.length).toBe(1);
    expect(messageWithMultipleReactions.reactions[0].reactedBy[0].userId).toBe('user-2');

    expect(mockFetcherSubmit).toHaveBeenCalledWith(
      { intent: 'react-message', id: 'msg-1', code: 'tada' },
      { method: 'POST' },
    );
  });

  it('removes reaction when current user is the only one who reacted', async () => {
    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    await result.current.onChangeReaction({ code: 'tada', skin: '', name: 'tada' });

    expect(message.reactions.length).toBe(1);
    expect(message.reactions[0].code).toBe('heart');

    expect(mockFetcherSubmit).toHaveBeenCalledWith(
      { intent: 'react-message', id: 'msg-1', code: 'tada' },
      { method: 'POST' },
    );
  });

  it('does not mutate or submit when user is not logged in', async () => {
    vi.mocked(useUser).mockReturnValue(null);

    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    await result.current.onChangeReaction({ code: 'thumbsup', skin: '', name: 'thumbsup' });

    expect(message.reactions.length).toBe(2);
    expect(mockFetcherSubmit).not.toHaveBeenCalled();
  });
});
