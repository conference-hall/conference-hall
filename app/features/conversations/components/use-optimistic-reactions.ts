import { useTranslation } from 'react-i18next';
import { useFetchers, useSubmit } from 'react-router';
import type { Emoji, EmojiReaction } from '~/shared/types/emojis.types.ts';

// todo(conversation): put somewhere else the list
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

export function useOptimisticReactions(id: string, intent: string, initialReactions: Array<EmojiReaction>) {
  const submit = useSubmit();
  const { t } = useTranslation();
  const you = t('common.you');

  // Form submission
  const onChangeEmoji = ({ code }: Emoji) => {
    submit(
      { intent, id, code },
      {
        method: 'POST',
        fetcherKey: `${intent}:${id}:${code}`,
        preventScrollReset: true,
        navigate: false,
      },
    );
  };

  // Optimistic list
  type PendingReactions = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const reactionsByCode = new Map(initialReactions.map((reaction) => [reaction.code, reaction]));

  const fetchers = useFetchers();

  const pendingReactions = fetchers
    .filter((fetcher): fetcher is PendingReactions => {
      if (!fetcher.formData) return false;
      const formIntent = fetcher.formData.get('intent');
      const formId = fetcher.formData.get('id');
      return formIntent === intent && formId === id;
    })
    .map((fetcher) => ({
      code: String(fetcher.formData?.get('code')),
    }));

  for (const reaction of pendingReactions) {
    const current = reactionsByCode.get(reaction.code);

    console.log(current);

    // add reaction
    if (!current) {
      reactionsByCode.set(reaction.code, { code: reaction.code, reacted: true, reactedBy: [you] });
      continue;
    }

    // increment reaction
    if (!current.reacted) {
      current.reacted = true;
      current.reactedBy.push(you);
      continue;
    }

    // decrement reaction
    if (current.reacted && current.reactedBy.length > 1) {
      current.reacted = false;
      current.reactedBy = current.reactedBy.filter((user) => user !== you);
      continue;
    }

    // delete reaction
    if (current.reacted && current.reactedBy.length === 1) {
      reactionsByCode.delete(reaction.code);
    }
  }

  return { optimisticReactions: Array.from(reactionsByCode.values()), onChangeEmoji };
}
