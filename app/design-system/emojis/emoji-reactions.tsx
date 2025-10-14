import { cva, cx } from 'class-variance-authority';
import { Trans, useTranslation } from 'react-i18next';
import { Tooltip } from '~/design-system/tooltip.tsx';
import { Text } from '~/design-system/typography.tsx';
import type { Emoji, EmojiReaction } from '~/shared/types/emojis.types.ts';

type EmojiReactionsProps = {
  emojis: Array<Emoji>;
  reactions: Array<EmojiReaction>;
  currentUserId?: string;
  onChangeEmoji: (emoji: Emoji) => void;
  className?: string;
};

const emojiReactionStyles = cva('flex items-center gap-2 rounded-full shrink-0 py-0.5 px-1.5 cursor-pointer', {
  variants: {
    reacted: {
      true: 'bg-blue-50 ring-1 ring-blue-600',
      false: 'bg-gray-100 hover:bg-white hover:ring-1 hover:ring-gray-600',
    },
  },
  defaultVariants: { reacted: false },
});

export function EmojiReactions({ emojis, reactions, currentUserId, onChangeEmoji, className }: EmojiReactionsProps) {
  const { t } = useTranslation();

  return (
    <ul className={cx('flex items-center flex-wrap gap-2', className)}>
      {reactions.map((reaction) => {
        const emoji = emojis.find((emoji) => emoji.code === reaction.code);
        if (!emoji) return null;

        const reactNames = reaction.reactedBy.map((users) => {
          if (users.userId === currentUserId) return t('common.you');
          return users.name;
        });

        const tooltip = (
          <Trans
            i18nKey="common.emoji.reacted-by"
            values={{ names: reactNames, emoji: emoji.skin }}
            components={[<strong key="0" />]}
          />
        );

        return (
          <li key={emoji.code}>
            <Tooltip text={tooltip}>
              <button
                type="button"
                aria-label={emoji.name}
                onClick={() => onChangeEmoji(emoji)}
                className={emojiReactionStyles({ reacted: reaction.reacted })}
              >
                <span className="font-serif text-[13px]">{emoji.skin}</span>
                <Text size="xs" weight="medium">
                  {reaction.reactedBy.length}
                </Text>
              </button>
            </Tooltip>
          </li>
        );
      })}
    </ul>
  );
}
