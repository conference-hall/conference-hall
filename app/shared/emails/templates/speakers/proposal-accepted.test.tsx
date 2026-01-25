import { render } from '@react-email/components';
import type { TemplateData } from './proposal-accepted.tsx';
import ProposalAcceptedEmail from './proposal-accepted.tsx';

// Mock any server-side modules that use process.env
vi.mock('../../../../servers/environment.server.ts', () => ({
  getSharedServerEnv: () => ({
    APP_URL: 'http://localhost:3000',
  }),
  initEnv: vi.fn(),
}));

describe('Proposal Accepted', () => {
  describe('Special Characters Handling', () => {
    const event: TemplateData['event'] = {
      id: 'bdx-io',
      slug: 'bdx-io',
      name: 'BDX I/O',
      logoUrl: null,
    };
    const proposal: TemplateData['proposal'] = {
      id: '123',
      title: 'Random Proposal w/ special characters ✨',
      formats: [{ name: 'Format 1' }, { name: 'Format 2' }],
      speakers: [{ email: 'test@test.com', locale: 'fr' }],
    };

    it('Payload does not escape special characters', async () => {
      const payload = ProposalAcceptedEmail.buildPayload({ event, proposal }, 'fr');

      expect(payload.subject).toContain('BDX I/O');
      expect(payload.from).toContain('BDX I/O');
    });

    it('Plain text does not escape special characters', async () => {
      const result = await render(
        <ProposalAcceptedEmail locale="fr" event={event} proposal={proposal} customization={null} preview={false} />,
        { plainText: true },
      );

      expect(result).not.toContain('I&#x2F;O');
      expect(result).toContain('I/O');
      expect(result).toContain('Random Proposal w/ special characters ✨');
    });
  });
});
