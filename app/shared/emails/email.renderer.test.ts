import { renderEmail } from './email.renderer.tsx';
import { getEmailTemplate } from './templates/templates.ts';

describe('Email Renderer', () => {
  describe('getEmailTemplateComponent', () => {
    it('loads and caches existing email template successfully', async () => {
      const result = await getEmailTemplate('base-email');

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
    });

    it('returns cached template on subsequent calls', async () => {
      // First call
      const result1 = await getEmailTemplate('base-email');
      // Second call should return cached version
      const result2 = await getEmailTemplate('base-email');

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1).toBe(result2);
    });

    it('handles template loading gracefully', async () => {
      // Test that the function can handle various template names
      // without throwing unhandled errors
      const result1 = await getEmailTemplate('base-email');
      const result2 = await getEmailTemplate('base-event-email');

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
    });
  });

  describe('renderEmail', () => {
    it('renders existing email template with HTML and text versions', async () => {
      const result = await renderEmail('base-email', { name: 'John' }, 'en', { color: 'blue' });

      expect(result?.html).toContain('<html dir="ltr" lang="en">');
      expect(result?.html).toContain('Powered by Conference Hall');

      expect(result?.text).not.toContain('<html dir="ltr" lang="en">');
      expect(result?.text).toContain('Powered by Conference Hall');
    });

    it('replaces http://www.w3.org with https://www.w3.org in HTML', async () => {
      const result = await renderEmail('base-email', {}, 'en', null);

      expect(result?.html).toContain('https://www.w3.org');
    });
  });
});
