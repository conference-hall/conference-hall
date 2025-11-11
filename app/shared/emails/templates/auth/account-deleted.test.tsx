import { render } from '@react-email/components';
import AccountDeletedEmail from './account-deleted.tsx';

vi.mock('servers/environment.server.ts', () => ({
  getSharedServerEnv: () => ({
    APP_URL: 'http://localhost:3000',
  }),
  initEnv: vi.fn(),
}));

describe('Account Deleted Email', () => {
  describe('buildPayload', () => {
    it('builds correct payload with deletion date', () => {
      const payload = AccountDeletedEmail.buildPayload('user@example.com', 'en', { deletionDate: '2025-11-11' });

      expect(payload.template).toEqual('auth-account-deleted');
      expect(payload.to).toEqual(['user@example.com']);
      expect(payload.locale).toEqual('en');
      expect(payload.subject).toEqual('Your Conference Hall account has been deleted');
      expect(payload.from).toEqual('Conference Hall <no-reply@mg.conference-hall.io>');
      expect(payload.data.deletionDate).toEqual('2025-11-11');
    });

    it('builds correct payload for French locale', () => {
      const payload = AccountDeletedEmail.buildPayload('user@example.com', 'fr', { deletionDate: '2025-11-11' });

      expect(payload.locale).toEqual('fr');
      expect(payload.subject).toEqual('Votre compte Conference Hall a été supprimé');
    });
  });

  describe('Template Rendering', () => {
    it('renders email in English with formatted date', async () => {
      const result = await render(<AccountDeletedEmail deletionDate="2025-11-11" locale="en" />, {
        plainText: true,
      });

      expect(result).toContain('ACCOUNT DELETED');
      expect(result).toContain('November 11, 2025');
      expect(result).toContain('Conference Hall team');
    });

    it('renders email in French with formatted date', async () => {
      const result = await render(<AccountDeletedEmail deletionDate="2025-11-11" locale="fr" />, {
        plainText: true,
      });

      expect(result).toContain('COMPTE SUPPRIMÉ');
      expect(result).toContain('11 novembre 2025');
      expect(result).toContain("L'équipe Conference Hall");
    });

    it('formats deletion date according to locale', async () => {
      const enResult = await render(<AccountDeletedEmail deletionDate="2024-12-25" locale="en" />, {
        plainText: true,
      });
      const frResult = await render(<AccountDeletedEmail deletionDate="2024-12-25" locale="fr" />, {
        plainText: true,
      });

      expect(enResult).toContain('December 25, 2024');
      expect(frResult).toContain('25 décembre 2024');
    });
  });
});
