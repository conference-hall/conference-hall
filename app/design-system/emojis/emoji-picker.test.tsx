import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { page } from 'vitest/browser';
import type { Emoji } from '~/shared/types/emojis.types.ts';
import { EmojiPicker } from './emoji-picker.tsx';

const EMOJIS: Array<Emoji> = [
  { code: '+1', skin: '👍', name: 'Thumbs up' },
  { code: '-1', skin: '👎', name: 'Thumbs down' },
];

describe('EmojiPicker component', () => {
  it('displays emoji picker and select an emoji', async () => {
    const onSelectEmoji = vi.fn();

    await page.render(
      <I18nextProvider i18n={i18nTest}>
        <EmojiPicker emojis={EMOJIS} icon={FaceSmileIcon} variant="secondary" onSelectEmoji={onSelectEmoji} />
      </I18nextProvider>,
    );

    const button = page.getByRole('button', { name: 'Select a reaction' });
    await expect.element(button).toHaveAttribute('aria-expanded', 'false');

    await button.click();
    await expect.element(button).toHaveAttribute('aria-expanded', 'true');

    const thumbsUpButton = page.getByRole('button', { name: 'Thumbs up' });
    await thumbsUpButton.click();

    await expect.element(button).toHaveAttribute('aria-expanded', 'false');
    expect(onSelectEmoji).toHaveBeenCalledWith(EMOJIS.at(0));
  });
});
