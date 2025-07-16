import { render } from '@react-email/components';
import ProposalDeclinedEmail from './proposal-declined.tsx';

// Mock any server-side modules that use process.env
vi.mock('servers/environment.server.ts', () => ({
  getSharedServerEnv: () => ({
    APP_URL: 'http://localhost:3000',
  }),
  initEnv: vi.fn(),
}));

describe('Proposal Declined', () => {
  describe('Special Characters Handling', () => {
    const event = {
      slug: 'bdx-io',
      name: 'BDX I/O',
      logoUrl: null,
      emailOrganizer: 'test@bdxio.com',
      emailNotifications: null,
      team: { slug: 'BDX I/O' },
    };
    const proposal = {
      id: '123',
      title: 'Random Proposal w/ special characters ✨',
      speakers: [{ name: 'Gwenaëlle B.' }],
    };

    it('Payload does not escape special characters', async () => {
      const payload = ProposalDeclinedEmail.buildPayload({ event, proposal }, 'fr');

      expect(payload.subject).toContain('BDX I/O');
      expect(payload.from).toContain('BDX I/O');
    });

    it('HTML does not escape special characters', async () => {
      const result = await render(<ProposalDeclinedEmail locale="fr" event={event} proposal={proposal} />);

      expect(result).not.toContain('I&#x2F;O');
      expect(result).toContain('Gwenaëlle B.');
      expect(result).toContain('Random Proposal w/ special characters ✨');
    });
  });
});
