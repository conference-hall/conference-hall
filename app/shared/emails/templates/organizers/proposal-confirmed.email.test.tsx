import { render, toPlainText } from 'react-email';
import type { TemplateData } from './proposal-confirmed.email.tsx';
import ProposalConfirmedEmail from './proposal-confirmed.email.tsx';

describe('Proposal Confirmed', () => {
  describe('Special Characters Handling', () => {
    const event: TemplateData['event'] = {
      slug: 'bdx-io',
      name: 'BDX I/O',
      logo: null,
      emailOrganizer: 'test@bdxio.com',
      emailNotifications: null,
      team: { slug: 'BDX I/O' },
    };
    const proposal: TemplateData['proposal'] = {
      id: '123',
      routeId: '456',
      title: 'Random Proposal w/ special characters ✨',
      speakers: [{ name: 'Gwenaëlle B.' }],
    };

    it('Payload does not escape special characters', async () => {
      const payload = ProposalConfirmedEmail.buildPayload({ event, proposal }, 'fr');

      expect(payload.subject).toContain('BDX I/O');
      expect(payload.from).toContain('BDX I/O');
    });

    it('Plain text does not escape special characters', async () => {
      const html = await render(<ProposalConfirmedEmail locale="fr" event={event} proposal={proposal} />);
      const text = toPlainText(html);

      expect(text).not.toContain('&#x2F;');
      expect(text).toContain('Gwenaëlle B.');
      expect(text).toContain('Random Proposal w/ special characters ✨');
    });
  });
});
