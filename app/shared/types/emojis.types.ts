export type Emoji = {
  code: string;
  skin: string;
  name: string;
};

export type EmojiReaction = {
  code: string;
  reacted: boolean;
  reactedBy: Array<{ userId: string; name: string }>;
};
