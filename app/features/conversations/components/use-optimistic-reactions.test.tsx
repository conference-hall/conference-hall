import { useFetchers, useSubmit } from 'react-router';
import { renderHook } from 'vitest-browser-react';
import { useUser } from '~/app-platform/components/user-context.tsx';
import type { Message } from '~/shared/types/conversation.types.ts';
import { useOptimisticReactions } from './use-optimistic-reactions.ts';

vi.mock('react-router', () => ({
  useFetchers: vi.fn(),
  useSubmit: vi.fn(),
}));

vi.mock('~/app-platform/components/user-context.tsx', () => ({
  useUser: vi.fn(),
}));

describe('useOptimisticReactions hook', () => {
  const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    picture: null,
    notificationsUnreadCount: 0,
    hasTeamAccess: true,
    teams: [],
  };

  const mockSubmit = vi.fn();

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
    vi.mocked(useSubmit).mockReturnValue(mockSubmit);
    vi.mocked(useFetchers).mockReturnValue([]);
  });

  it('returns original reactions when no pending operations', async () => {
    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    expect(result.current.reactions.length).toBe(2);
    expect(result.current.reactions[0].code).toBe('tada');
    expect(result.current.reactions[0].reacted).toBe(true);
    expect(result.current.reactions[1].code).toBe('heart');
    expect(result.current.reactions[1].reacted).toBe(false);
  });

  it('adds new reaction optimistically', async () => {
    const formData = new FormData();
    formData.append('intent', 'react-message');
    formData.append('id', 'msg-1');
    formData.append('code', 'thumbsup');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    expect(result.current.reactions.length).toBe(3);
    expect(result.current.reactions[2].code).toBe('thumbsup');
    expect(result.current.reactions[2].reacted).toBe(true);
    expect(result.current.reactions[2].reactedBy.length).toBe(1);
    expect(result.current.reactions[2].reactedBy[0].userId).toBe('user-1');
  });

  it('increments existing reaction when current user reacts', async () => {
    const formData = new FormData();
    formData.append('intent', 'react-message');
    formData.append('id', 'msg-1');
    formData.append('code', 'heart');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    expect(result.current.reactions.length).toBe(2);
    const heartReaction = result.current.reactions.find((r) => r.code === 'heart');
    expect(heartReaction?.reacted).toBe(true);
    expect(heartReaction?.reactedBy.length).toBe(2);
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

    const formData = new FormData();
    formData.append('intent', 'react-message');
    formData.append('id', 'msg-1');
    formData.append('code', 'tada');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticReactions(messageWithMultipleReactions, 'message'));

    expect(result.current.reactions.length).toBe(1);
    expect(result.current.reactions[0].code).toBe('tada');
    expect(result.current.reactions[0].reacted).toBe(false);
    expect(result.current.reactions[0].reactedBy.length).toBe(1);
    expect(result.current.reactions[0].reactedBy[0].userId).toBe('user-2');
  });

  it('removes reaction when current user is the only one who reacted', async () => {
    const formData = new FormData();
    formData.append('intent', 'react-message');
    formData.append('id', 'msg-1');
    formData.append('code', 'tada');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    expect(result.current.reactions.length).toBe(1);
    expect(result.current.reactions[0].code).toBe('heart');
  });

  it('handles multiple pending reactions', async () => {
    const formData1 = new FormData();
    formData1.append('intent', 'react-message');
    formData1.append('id', 'msg-1');
    formData1.append('code', 'thumbsup');

    const formData2 = new FormData();
    formData2.append('intent', 'react-message');
    formData2.append('id', 'msg-1');
    formData2.append('code', 'fire');

    vi.mocked(useFetchers).mockReturnValue([
      { formData: formData1, state: 'submitting' } as never,
      { formData: formData2, state: 'submitting' } as never,
    ]);

    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    expect(result.current.reactions.length).toBe(4);
    expect(result.current.reactions.map((r) => r.code)).toContain('thumbsup');
    expect(result.current.reactions.map((r) => r.code)).toContain('fire');
  });

  it('ignores fetchers for different messages', async () => {
    const formData = new FormData();
    formData.append('intent', 'react-message');
    formData.append('id', 'msg-2');
    formData.append('code', 'thumbsup');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    expect(result.current.reactions.length).toBe(2);
    expect(result.current.reactions[0].code).toBe('tada');
    expect(result.current.reactions[1].code).toBe('heart');
  });

  it('ignores fetchers with different intent suffix', async () => {
    const formData = new FormData();
    formData.append('intent', 'react-other');
    formData.append('id', 'msg-1');
    formData.append('code', 'thumbsup');

    vi.mocked(useFetchers).mockReturnValue([{ formData, state: 'submitting' } as never]);

    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    expect(result.current.reactions.length).toBe(2);
  });

  it('returns onChangeReaction callback that calls submit', async () => {
    const { result } = await renderHook(() => useOptimisticReactions(message, 'message'));

    result.current.onChangeReaction({ code: 'thumbsup', skin: '', name: 'thumbsup' });

    expect(mockSubmit).toHaveBeenCalledWith(
      { intent: 'react-message', id: 'msg-1', code: 'thumbsup' },
      {
        method: 'POST',
        fetcherKey: 'react-message:msg-1:thumbsup',
        preventScrollReset: true,
        navigate: false,
      },
    );
  });
});
