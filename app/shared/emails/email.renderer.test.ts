import { vi } from 'vitest';

// Mock @react-email/components render function
vi.mock('@react-email/components', () => ({
  render: vi.fn(),
}));

import { render } from '@react-email/components';
import { renderEmail } from './email.renderer.tsx';
import { getEmailTemplate } from './templates/templates.ts';

const mockRender = vi.mocked(render);

// Mock console.error to test error handling
const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('Email Renderer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    consoleErrorSpy.mockClear();
  });

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
    beforeEach(() => {
      mockRender.mockClear();
    });

    it('renders existing email template with HTML and text versions', async () => {
      mockRender.mockResolvedValueOnce('<html>Welcome HTML</html>').mockResolvedValueOnce('Welcome Text');

      const result = await renderEmail('base-email', { name: 'John' }, 'en', { color: 'blue' });

      expect(result).toEqual({ html: '<html>Welcome HTML</html>', text: 'Welcome Text' });

      expect(mockRender).toHaveBeenCalledTimes(2);
      // First call for HTML
      expect(mockRender).toHaveBeenNthCalledWith(1, expect.anything());
      // Second call for text with plainText option
      expect(mockRender).toHaveBeenNthCalledWith(2, expect.anything(), { plainText: true });
    });

    it('replaces http://www.w3.org with https://www.w3.org in HTML', async () => {
      mockRender.mockResolvedValueOnce('<html>http://www.w3.org/test</html>');

      const result = await renderEmail('base-email', {}, 'en', null);

      expect(result?.html).toBe('<html>https://www.w3.org/test</html>');
    });

    it('handles null customization parameter', async () => {
      mockRender.mockResolvedValueOnce('<html>Test</html>').mockResolvedValueOnce('Test');

      const result = await renderEmail('base-email', { test: 'data' }, 'en', null);

      expect(result).toEqual({ html: '<html>Test</html>', text: 'Test' });
      expect(mockRender).toHaveBeenCalledTimes(2);
    });
  });
});
