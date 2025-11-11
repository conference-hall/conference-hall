import type { EmojiReaction } from './emojis.types.ts';

export type MessageRole = 'SPEAKER' | 'ORGANIZER';

export type Message = {
  id: string;
  sender: {
    userId: string;
    name: string;
    picture: string | null;
    role?: MessageRole;
  };
  content: string;
  reactions: Array<EmojiReaction>;
  sentAt: Date;
};
