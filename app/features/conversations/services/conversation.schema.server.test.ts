import { MESSAGE_MAX_LENGTH } from '~/shared/types/conversation.types.ts';
import { ConversationMessageSaveSchema } from './conversation.schema.server.ts';

describe('ConversationMessageSaveSchema', () => {
  it('accepts a message at the maximum length', () => {
    const result = ConversationMessageSaveSchema.safeParse({ message: 'a'.repeat(MESSAGE_MAX_LENGTH) });
    expect(result.success).toBe(true);
  });

  it('rejects a message over the maximum length', () => {
    const result = ConversationMessageSaveSchema.safeParse({ message: 'a'.repeat(MESSAGE_MAX_LENGTH + 1) });
    expect(result.success).toBe(false);
    expect(result.error?.issues.at(0)?.message).toBe('The message is too long');
  });

  it('rejects an empty message', () => {
    const result = ConversationMessageSaveSchema.safeParse({ message: '' });
    expect(result.success).toBe(false);
    expect(result.error?.issues.at(0)?.message).toBe('A message is required');
  });
});
