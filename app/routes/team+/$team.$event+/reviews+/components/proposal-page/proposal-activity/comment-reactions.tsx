import { useFetchers, useSubmit } from 'react-router';
import { EmojiReactions } from '~/routes/components/emojis/emoji-reactions.tsx';
import type { Emoji, EmojiReaction } from '~/types/emojis.types';

export const EMOJIS: Array<Emoji> = [
  { code: '+1', skin: '👍', name: 'Thumbs up' },
  { code: '-1', skin: '👎', name: 'Thumbs down' },
  { code: 'heart', skin: '❤️', name: 'Heart' },
  { code: 'smile', skin: '😄', name: 'Laughing' },
  { code: 'cry', skin: '😢', name: 'Sadness' },
  { code: 'tada', skin: '🎉', name: 'Celebration' },
  { code: 'rocket', skin: '🚀', name: 'Excitement' },
  { code: 'fire', skin: '🔥', name: 'Trending' },
  { code: 'clap', skin: '👏', name: 'Applause' },
  { code: 'thinking_face', skin: '🤔', name: 'Thinking' },
];

type CommentReactions = { commentId: string; reactions: Array<EmojiReaction> };

export function CommentReactions({ commentId, reactions }: CommentReactions) {
  const optimisticReactions = useOptimisticReactions(commentId, reactions);

  const submit = useSubmit();

  const onChangeEmoji = ({ code }: Emoji) => {
    submit(
      { intent: 'react-to-comment', commentId, code },
      {
        method: 'POST',
        fetcherKey: `react-to-comment:${commentId}:${code}`,
        navigate: false,
        preventScrollReset: true,
      },
    );
  };

  return (
    <EmojiReactions
      emojis={EMOJIS}
      reactions={optimisticReactions}
      onChangeEmoji={onChangeEmoji}
      className="justify-end mt-1"
    />
  );
}

function useOptimisticReactions(commentId: string, initialReactions: Array<EmojiReaction>) {
  type PendingReactions = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const reactionsByCode = new Map(initialReactions.map((reaction) => [reaction.code, reaction]));

  const fetchers = useFetchers();

  const pendingReactions = fetchers
    .filter((fetcher): fetcher is PendingReactions => {
      if (!fetcher.formData) return false;
      const formIntent = fetcher.formData.get('intent');
      const formCommentId = fetcher.formData.get('commentId');
      return formIntent === 'react-to-comment' && formCommentId === commentId;
    })
    .map((fetcher) => ({
      code: String(fetcher.formData?.get('code')),
    }));

  for (const reaction of pendingReactions) {
    const current = reactionsByCode.get(reaction.code);

    // add reaction
    if (!current) {
      reactionsByCode.set(reaction.code, { code: reaction.code, reacted: true, reactedBy: ['You'] });
      continue;
    }

    // increment reaction
    if (!current.reacted) {
      current.reacted = true;
      current.reactedBy.push('You');
      continue;
    }

    // decrement reaction
    if (current.reacted && current.reactedBy.length > 1) {
      current.reacted = false;
      current.reactedBy = current.reactedBy.filter((user) => user !== 'You');
      continue;
    }

    // delete reaction
    if (current.reacted && current.reactedBy.length === 1) {
      reactionsByCode.delete(reaction.code);
    }
  }

  return Array.from(reactionsByCode.values());
}
