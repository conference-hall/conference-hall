import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';
import { EmojiAddIcon } from '~/shared/design-system/icons/emoji-add-icon.tsx';
import type { Emoji } from '../../types/emojis.types.ts';

type EmojiPickerProps = {
  emojis: Array<Emoji>;
  disabledEmojis?: Array<string>;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onSelectEmoji: (emoji: Emoji) => void;
};

export function EmojiPicker({ emojis, disabledEmojis = [], label, icon: Icon, onSelectEmoji }: EmojiPickerProps) {
  const { t } = useTranslation();

  return (
    <Popover className="relative">
      <PopoverButton
        className="flex items-center justify-center rounded-full shrink-0 h-6 w-6 bg-gray-100 fill-gray-600 cursor-pointer hover:bg-white hover:ring-1 hover:ring-gray-600"
        aria-label={label || t('common.emoji.select')}
        title={label || t('common.emoji.select')}
      >
        {Icon ? (
          <Icon className="h-4 w-4" aria-hidden="true" />
        ) : (
          <EmojiAddIcon className="h-4 w-4" aria-hidden="true" />
        )}
      </PopoverButton>

      <PopoverPanel
        anchor="top"
        className="grid grid-cols-5 gap-2 p-2 bg-white border border-gray-200 rounded-2xl shadow-sm [--anchor-gap:8px] z-50"
      >
        {({ close }) => (
          <>
            {emojis.map((emoji) => {
              const disabled = disabledEmojis.includes(emoji.code);

              return (
                <button
                  key={emoji.code}
                  type="button"
                  className={cx(
                    'flex items-center justify-center rounded-lg shrink-0 h-8 w-8 cursor-pointer font-serif text-lg hover:bg-gray-100',
                    { 'grayscale cursor-not-allowed': disabled },
                  )}
                  aria-label={emoji.name}
                  title={emoji.name}
                  disabled={disabled}
                  onClick={() => {
                    onSelectEmoji(emoji);
                    close();
                  }}
                >
                  {emoji.skin}
                </button>
              );
            })}
          </>
        )}
      </PopoverPanel>
    </Popover>
  );
}
