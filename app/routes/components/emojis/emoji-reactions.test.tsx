import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { Emoji, EmojiReaction } from '../../../types/emojis.types.ts';
import { EmojiReactions } from './emoji-reactions.tsx';

const EMOJIS: Array<Emoji> = [
  { code: '+1', skin: '👍', name: 'Thumbs up' },
  { code: '-1', skin: '👎', name: 'Thumbs down' },
];

const REACTIONS: Array<EmojiReaction> = [
  { code: '+1', reacted: true, reactedBy: ['You'] },
  { code: '-1', reacted: false, reactedBy: ['Other'] },
];

describe('EmojiReactions component', () => {
  it('displays emoji reactions', async () => {
    const onChangeEmoji = vi.fn();

    render(<EmojiReactions emojis={EMOJIS} reactions={REACTIONS} onChangeEmoji={onChangeEmoji} />);

    const addButton = screen.getByRole('button', { name: 'Select a reaction' });
    expect(addButton).toHaveAttribute('aria-expanded', 'false');

    const thumbsUpButton = await screen.findByRole('button', { name: 'Thumbs up' });
    await userEvent.click(thumbsUpButton);
    expect(onChangeEmoji).toHaveBeenCalledWith(EMOJIS.at(0));

    const thumbsDownButton = await screen.findByRole('button', { name: 'Thumbs down' });
    await userEvent.click(thumbsDownButton);
    expect(onChangeEmoji).toHaveBeenCalledWith(EMOJIS.at(1));
  });
});
