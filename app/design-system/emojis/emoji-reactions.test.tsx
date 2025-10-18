import { userEvent } from '@vitest/browser/context';
import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.tsx';
import { render } from 'vitest-browser-react';
import type { Emoji, EmojiReaction } from '~/shared/types/emojis.types.ts';
import { EmojiReactions } from './emoji-reactions.tsx';

const EMOJIS: Array<Emoji> = [
  { code: '+1', skin: '👍', name: 'Thumbs up' },
  { code: '-1', skin: '👎', name: 'Thumbs down' },
];

const REACTIONS: Array<EmojiReaction> = [
  { code: '+1', reacted: true, reactedBy: [{ userId: 'user1', name: 'You' }] },
  { code: '-1', reacted: false, reactedBy: [{ userId: 'user2', name: 'Other' }] },
];

describe('EmojiReactions component', () => {
  it('displays emoji reactions', async () => {
    const onChangeEmoji = vi.fn();

    const screen = render(
      <I18nextProvider i18n={i18nTest}>
        <EmojiReactions emojis={EMOJIS} reactions={REACTIONS} onChangeEmoji={onChangeEmoji} />
      </I18nextProvider>,
    );

    const thumbsUpButton = screen.getByRole('button', { name: 'Thumbs up' });
    await userEvent.click(thumbsUpButton);
    expect(onChangeEmoji).toHaveBeenCalledWith(EMOJIS.at(0));

    const thumbsDownButton = screen.getByRole('button', { name: 'Thumbs down' });
    await userEvent.click(thumbsDownButton);
    expect(onChangeEmoji).toHaveBeenCalledWith(EMOJIS.at(1));
  });
});
