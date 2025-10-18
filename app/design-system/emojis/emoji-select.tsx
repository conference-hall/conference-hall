import { PlusIcon } from '@heroicons/react/20/solid';
import { useTranslation } from 'react-i18next';
import type { Emoji } from '~/shared/types/emojis.types.ts';
import { EmojiPicker } from './emoji-picker.tsx';

type EmojiReactionsProps = {
  emojis: Array<Emoji>;
  selectedEmojis: Array<string>;
  onChangeEmojis: (emojis: Array<string>) => void;
  className?: string;
};

export function EmojiSelect({ emojis, selectedEmojis, onChangeEmojis }: EmojiReactionsProps) {
  const { t } = useTranslation();

  const handleSelect = (selected?: Emoji) => {
    if (!selected) return;
    if (selectedEmojis.includes(selected.code)) {
      return onChangeEmojis(selectedEmojis.filter((code) => code !== selected.code));
    }
    return onChangeEmojis([...selectedEmojis, selected.code]);
  };

  return (
    <div className="flex gap-3">
      {selectedEmojis.map((code) => {
        const emoji = emojis.find((e) => e.code === code);
        return (
          <button
            key={emoji?.code}
            type="button"
            onClick={() => handleSelect(emoji)}
            aria-label={`Remove emoji ${code}`}
            className="cursor-pointer hover:opacity-50"
          >
            {emoji?.skin}
          </button>
        );
      })}

      <EmojiPicker
        label={t('common.choose-an-emoji')}
        emojis={emojis}
        icon={PlusIcon}
        onSelectEmoji={handleSelect}
        anchor="top"
      />
    </div>
  );
}
