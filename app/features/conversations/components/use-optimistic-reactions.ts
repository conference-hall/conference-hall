import { useTranslation } from 'react-i18next';
import { useFetchers, useSubmit } from 'react-router';
import type { Message } from '~/shared/types/conversation.types.ts';
import type { Emoji } from '~/shared/types/emojis.types.ts';

export function useOptimisticReactions(message: Message, intentSuffix: string) {
  const submit = useSubmit();
  const { t } = useTranslation();
  const you = t('common.you');

  const intent = `react-${intentSuffix}`;

  // Form submission
  const onChangeReaction = ({ code }: Emoji) => {
    submit(
      { intent, id: message.id, code },
      {
        method: 'POST',
        fetcherKey: `${intent}:${message.id}:${code}`,
        preventScrollReset: true,
        navigate: false,
      },
    );
  };

  // Optimistic list
  type PendingReactions = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  const reactionsByCode = new Map(message.reactions.map((reaction) => [reaction.code, reaction]));

  const fetchers = useFetchers();

  const pendingReactions = fetchers
    .filter((fetcher): fetcher is PendingReactions => {
      if (!fetcher.formData) return false;
      const formIntent = fetcher.formData.get('intent');
      const formId = fetcher.formData.get('id');
      return formIntent === intent && formId === message.id;
    })
    .map((fetcher) => ({
      code: String(fetcher.formData?.get('code')),
    }));

  for (const reaction of pendingReactions) {
    const current = reactionsByCode.get(reaction.code);

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

  return { reactions: Array.from(reactionsByCode.values()), onChangeReaction };
}
