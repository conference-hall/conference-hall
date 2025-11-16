import { render } from '@react-email/components';
import type { TemplateData } from './conversation-message.tsx';
import ConversationMessageEmail from './conversation-message.tsx';

vi.mock('@conference-hall/shared/environment.ts', () => ({
  getSharedServerEnv: () => ({
    APP_URL: 'http://localhost:3000',
  }),
  initEnv: vi.fn(),
}));

describe('Conversation Message Email', () => {
  const mockData: TemplateData = {
    recipient: {
      email: 'test@test.com',
      role: 'SPEAKER',
    },
    event: {
      id: 'event-1',
      slug: 'awesome-event',
      name: 'Awesome Event',
      logoUrl: null,
      teamSlug: 'awesome-team',
    },
    proposal: {
      id: 'proposal-1',
    },
    sender: {
      name: 'John Doe',
      role: 'ORGANIZER',
    },
    message: {
      content: 'This is a test message',
      preview: 'This is a test message',
    },
    messagesCount: 1,
  };

  describe('buildPayload', () => {
    it('returns correct email payload with English locale', () => {
      const payload = ConversationMessageEmail.buildPayload(mockData, 'en');

      expect(payload.template).toBe('speakers-conversation-message');
      expect(payload.subject).toContain('Awesome Event');
      expect(payload.from).toContain('Awesome Event');
      expect(payload.to).toEqual(['test@test.com']);
      expect(payload.locale).toBe('en');
      expect(payload.customEventId).toBe('event-1');
    });

    it('returns correct email payload with French locale', () => {
      const payload = ConversationMessageEmail.buildPayload(mockData, 'fr');

      expect(payload.locale).toBe('fr');
      expect(payload.to).toEqual(['test@test.com']);
    });

    it('defaults to English locale when no locale provided', () => {
      const payload = ConversationMessageEmail.buildPayload(mockData);

      expect(payload.locale).toBe('en');
    });

    it('handles event name with special characters', () => {
      const dataWithSpecialChars: TemplateData = {
        ...mockData,
        event: {
          ...mockData.event,
          name: 'BDX I/O 2024 ✨',
        },
      };

      const payload = ConversationMessageEmail.buildPayload(dataWithSpecialChars, 'en');

      expect(payload.subject).toContain('BDX I/O 2024 ✨');
      expect(payload.from).toContain('BDX I/O 2024 ✨');
    });

    it('includes all template data in payload', () => {
      const payload = ConversationMessageEmail.buildPayload(mockData, 'en');

      expect(payload.data).toEqual(mockData);
    });
  });

  describe('rendering', () => {
    it('renders plain text without escaping special characters', async () => {
      const dataWithSpecialChars: TemplateData = {
        ...mockData,
        event: {
          ...mockData.event,
          name: 'Conference & Meetup 2024',
        },
        sender: {
          name: 'Jean-François',
          role: 'ORGANIZER',
        },
        message: {
          content: "Hello! Let's discuss your proposal ✨",
          preview: "Hello! Let's discuss your proposal ✨",
        },
      };

      const result = await render(<ConversationMessageEmail {...dataWithSpecialChars} locale="en" />, {
        plainText: true,
      });

      expect(result).toContain('Conference & Meetup 2024');
      expect(result).not.toContain('&amp;');
      expect(result).toContain('Jean-François');
      expect(result).toContain('✨');
    });

    it('renders sender name correctly', async () => {
      const result = await render(<ConversationMessageEmail {...mockData} locale="en" />, { plainText: true });

      expect(result).toContain('John Doe');
    });

    it('renders message preview for single message', async () => {
      const result = await render(<ConversationMessageEmail {...mockData} locale="en" />, { plainText: true });

      expect(result).toContain('This is a test message');
    });

    it('does not render preview when multiple messages', async () => {
      const dataWithMultipleMessages: TemplateData = {
        ...mockData,
        messagesCount: 3,
      };

      const result = await render(<ConversationMessageEmail {...dataWithMultipleMessages} locale="en" />, {
        plainText: true,
      });

      expect(result).not.toContain('This is a test message');
    });

    it('renders in French', async () => {
      const result = await render(<ConversationMessageEmail {...mockData} locale="fr" />, { plainText: true });

      expect(result).toContain('Voir la conversation');
    });

    it('truncates long message preview', async () => {
      const longMessage = 'a'.repeat(200);
      const dataWithLongMessage: TemplateData = {
        ...mockData,
        message: {
          content: longMessage,
          preview: longMessage.substring(0, 150),
        },
      };

      const result = await render(<ConversationMessageEmail {...dataWithLongMessage} locale="en" />, {
        plainText: true,
      });

      expect(result).toContain('...');
    });
  });
});
