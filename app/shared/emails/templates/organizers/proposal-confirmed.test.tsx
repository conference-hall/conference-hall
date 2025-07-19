import { render } from '@react-email/components';
import type { TemplateData } from './proposal-confirmed.tsx';
import ProposalConfirmedEmail from './proposal-confirmed.tsx';

// Mock any server-side modules that use process.env
vi.mock('servers/environment.server.ts', () => ({
  getSharedServerEnv: () => ({
    APP_URL: 'http://localhost:3000',
  }),
  initEnv: vi.fn(),
}));

describe('Proposal Confirmed', () => {
  describe('Special Characters Handling', () => {
    const event: TemplateData['event'] = {
      slug: 'bdx-io',
      name: 'BDX I/O',
      logoUrl: null,
      emailOrganizer: 'test@bdxio.com',
      emailNotifications: null,
      team: { slug: 'BDX I/O' },
    };
    const proposal: TemplateData['proposal'] = {
      id: '123',
      title: 'Random Proposal w/ special characters ✨',
      speakers: [{ name: 'Gwenaëlle B.' }],
    };

    it('Payload does not escape special characters', async () => {
      const payload = ProposalConfirmedEmail.buildPayload({ event, proposal }, 'fr');

      expect(payload.subject).toContain('BDX I/O');
      expect(payload.from).toContain('BDX I/O');
    });

    it('Plain text does not escape special characters', async () => {
      const result = await render(<ProposalConfirmedEmail locale="fr" event={event} proposal={proposal} />, {
        plainText: true,
      });

      expect(result).not.toContain('I&#x2F;O');
      expect(result).toContain('I/O');
      expect(result).toContain('Gwenaëlle B.');
      expect(result).toContain('Random Proposal w/ special characters ✨');
    });
  });
});
