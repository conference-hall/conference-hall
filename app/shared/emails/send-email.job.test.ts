import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('~/shared/emails/email.renderer.tsx', () => ({
  renderEmail: vi.fn(),
}));

vi.mock('./providers/provider.ts', () => ({
  getEmailProvider: vi.fn(),
}));

import { renderEmail } from '~/shared/emails/email.renderer.tsx';
import { eventEmailCustomizationFactory } from '../../../tests/factories/event-email-customizations.ts';
import { eventFactory } from '../../../tests/factories/events.ts';
import { getEmailProvider } from './providers/provider.ts';
import type { EmailPayload } from './send-email.job.ts';
import { sendEmail } from './send-email.job.ts';

const mockRenderEmail = vi.mocked(renderEmail);
const mockGetEmailProvider = vi.mocked(getEmailProvider);

// Mock email provider
const mockEmailProvider = {
  send: vi.fn(),
};

describe('Send Email Job', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetEmailProvider.mockReturnValue(mockEmailProvider);
  });

  describe('sendEmail job', () => {
    const defaultPayload: EmailPayload = {
      template: 'speakers-proposal-submitted',
      from: 'noreply@example.com',
      to: ['user@example.com'],
      subject: 'Test Email',
      data: { name: 'John Doe' },
      locale: 'en',
    };

    it('sends email successfully with basic payload', async () => {
      mockRenderEmail.mockResolvedValue({ html: '<html>Test HTML</html>', text: 'Test Text' });

      await sendEmail.config.run(defaultPayload);

      expect(mockRenderEmail).toHaveBeenCalledWith('speakers-proposal-submitted', { name: 'John Doe' }, 'en', null);

      expect(mockEmailProvider.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['user@example.com'],
        subject: 'Test Email',
        html: '<html>Test HTML</html>',
        text: 'Test Text',
      });
    });

    it('sends email with customization data from database', async () => {
      const event = await eventFactory();
      const customization = await eventEmailCustomizationFactory({
        event,
        traits: ['speakers-proposal-submitted'],
        attributes: {
          locale: 'en',
          subject: 'Custom Subject',
          content: 'Custom markdown content',
        },
      });

      const payloadWithCustomization: EmailPayload = {
        ...defaultPayload,
        customEventId: event.id,
      };

      mockRenderEmail.mockResolvedValue({ html: '<html>Custom HTML</html>', text: 'Custom Text' });

      await sendEmail.config.run(payloadWithCustomization);

      expect(mockRenderEmail).toHaveBeenCalledWith(
        'speakers-proposal-submitted',
        { name: 'John Doe' },
        'en',
        customization,
      );

      expect(mockEmailProvider.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['user@example.com'],
        subject: customization.subject,
        html: '<html>Custom HTML</html>',
        text: 'Custom Text',
      });
    });

    it('uses original subject when customization has no subject', async () => {
      const event = await eventFactory();
      await eventEmailCustomizationFactory({
        event,
        traits: ['speakers-proposal-submitted'],
        attributes: {
          locale: 'en',
          subject: null,
        },
      });

      const payloadWithCustomization: EmailPayload = {
        ...defaultPayload,
        customEventId: event.id,
      };

      mockRenderEmail.mockResolvedValue({ html: '<html>HTML</html>', text: 'Text' });

      await sendEmail.config.run(payloadWithCustomization);

      expect(mockEmailProvider.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['user@example.com'],
        subject: 'Test Email',
        html: '<html>HTML</html>',
        text: 'Text',
      });
    });

    it('filters out empty email addresses from recipients', async () => {
      const payloadWithEmptyEmails: EmailPayload = {
        ...defaultPayload,
        to: ['user1@example.com', '', 'user2@example.com', null as any, 'user3@example.com'],
      };

      mockRenderEmail.mockResolvedValue({ html: '<html>Test</html>', text: 'Test' });

      await sendEmail.config.run(payloadWithEmptyEmails);

      expect(mockEmailProvider.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
        subject: 'Test Email',
        html: '<html>Test</html>',
        text: 'Test',
      });
    });

    it('handles different locales correctly', async () => {
      const event = await eventFactory();
      const customization = await eventEmailCustomizationFactory({
        event,
        traits: ['speakers-proposal-submitted', 'french'],
        attributes: { subject: 'Sujet personnalisé' },
      });

      const frenchPayload: EmailPayload = {
        ...defaultPayload,
        locale: 'fr',
        customEventId: event.id,
      };

      mockRenderEmail.mockResolvedValue({ html: '<html>Bonjour</html>', text: 'Bonjour' });

      await sendEmail.config.run(frenchPayload);

      expect(mockRenderEmail).toHaveBeenCalledWith(
        'speakers-proposal-submitted',
        { name: 'John Doe' },
        'fr',
        customization,
      );

      expect(mockEmailProvider.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['user@example.com'],
        subject: 'Sujet personnalisé',
        html: '<html>Bonjour</html>',
        text: 'Bonjour',
      });
    });

    it('handles case when customization does not exist in database', async () => {
      const event = await eventFactory();

      const payloadWithNonExistentCustomization: EmailPayload = {
        ...defaultPayload,
        customEventId: event.id,
      };

      mockRenderEmail.mockResolvedValue({ html: '<html>Default</html>', text: 'Default' });

      await sendEmail.config.run(payloadWithNonExistentCustomization);

      expect(mockRenderEmail).toHaveBeenCalledWith('speakers-proposal-submitted', { name: 'John Doe' }, 'en', null);

      expect(mockEmailProvider.send).toHaveBeenCalledWith({
        from: 'noreply@example.com',
        to: ['user@example.com'],
        subject: 'Test Email',
        html: '<html>Default</html>',
        text: 'Default',
      });
    });

    it('rejects when email provider is not found', async () => {
      mockGetEmailProvider.mockReturnValue(null);

      await expect(sendEmail.config.run(defaultPayload)).rejects.toBe('Email provider not found');

      expect(mockRenderEmail).not.toHaveBeenCalled();
      expect(mockEmailProvider.send).not.toHaveBeenCalled();
    });

    it('rejects when email rendering fails', async () => {
      mockRenderEmail.mockResolvedValue(null);

      await expect(sendEmail.config.run(defaultPayload)).rejects.toBe('Email rendering failed');

      expect(mockEmailProvider.send).not.toHaveBeenCalled();
    });

    it('propagates email provider send errors', async () => {
      const sendError = new Error('Failed to send email');
      mockRenderEmail.mockResolvedValue({ html: '<html>Test</html>', text: 'Test' });
      mockEmailProvider.send.mockRejectedValue(sendError);

      await expect(sendEmail.config.run(defaultPayload)).rejects.toThrow('Failed to send email');
    });
  });
});
