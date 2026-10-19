import { renderEmail } from '~/shared/emails/email.renderer.tsx';
import SpeakerInvitationEmail from './event-invitation.email.tsx';

describe('Speaker invitation email', () => {
  const data = {
    eventName: 'BDX I/O',
    teamName: 'BDX team',
    organizerName: 'Alex',
    message: 'Hello <script>alert("test")</script>,\nWould you speak at our event?',
    invitationUrl: 'https://example.com/invite/event/secret-token',
  };

  it.each(['en', 'fr'])('includes the custom message safely in the HTML and text email (%s)', async (locale) => {
    const rendered = await renderEmail('speakers-event-invitation', data, locale, null);
    expect(rendered).not.toBeNull();
    expect(rendered!.html).not.toContain('<script>');
    expect(rendered!.html).toContain('&lt;script&gt;');
    expect(rendered!.html).toContain('<br');
    expect(rendered!.text).toContain(data.message);
    expect(rendered!.text).toContain(data.invitationUrl);
    expect(rendered!.text).toContain('BDX I/O');
  });

  it('omits the optional message section when no message is provided', async () => {
    const rendered = await renderEmail('speakers-event-invitation', { ...data, message: null }, 'en', null);
    expect(rendered!.text).not.toContain('Message from the organizer');
    expect(rendered!.text).toContain('Review invitation');
    expect(rendered!.text).toContain('seven days');
  });

  it('uses the invited account email and locale without putting the personal message in the subject', () => {
    const payload = SpeakerInvitationEmail.buildPayload('speaker@example.com', 'fr', data);
    expect(payload).toMatchObject({ to: ['speaker@example.com'], locale: 'fr', data });
    expect(payload.subject).toContain('BDX I/O');
    expect(payload.subject).not.toContain(data.message);
  });
});
