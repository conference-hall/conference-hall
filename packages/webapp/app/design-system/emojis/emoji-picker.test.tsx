import type { Emoji } from '@conference-hall/shared/types/emojis.types.ts';
import { FaceSmileIcon } from '@heroicons/react/24/outline';
import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { userEvent } from 'vitest/browser';
import { render } from 'vitest-browser-react';
import { EmojiPicker } from './emoji-picker.tsx';

const EMOJIS: Array<Emoji> = [
  { code: '+1', skin: '👍', name: 'Thumbs up' },
  { code: '-1', skin: '👎', name: 'Thumbs down' },
];

describe('EmojiPicker component', () => {
  it('displays emoji picker and select an emoji', async () => {
    const onSelectEmoji = vi.fn();

    const screen = await render(
      <I18nextProvider i18n={i18nTest}>
        <EmojiPicker emojis={EMOJIS} icon={FaceSmileIcon} variant="secondary" onSelectEmoji={onSelectEmoji} />
      </I18nextProvider>,
    );

    const button = screen.getByRole('button', { name: 'Select a reaction' });
    await expect.element(button).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(button);
    await expect.element(button).toHaveAttribute('aria-expanded', 'true');

    const thumbsUpButton = screen.getByRole('button', { name: 'Thumbs up' });
    await userEvent.click(thumbsUpButton);

    await expect.element(button).toHaveAttribute('aria-expanded', 'false');
    expect(onSelectEmoji).toHaveBeenCalledWith(EMOJIS.at(0));
  });
});
