import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ZodError } from 'zod';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { sendEmail } from '~/shared/emails/send-email.job.ts';
import {
  ForbiddenOperationError,
  InvitationInvalidOrAccepted,
  SpeakerEmailAlreadyExistsError,
  SpeakerInvitationAlreadyExistsError,
  SpeakerInvitationDeliveryError,
  UserNotFoundError,
} from '~/shared/errors.server.ts';
import { UserAccount } from '~/shared/user/user-account.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event, Team, User } from '../../../../../prisma/generated/client.ts';
import { EventSpeakerInvitations } from './event-speaker-invitations.server.ts';

describe('EventSpeakerInvitations', () => {
  let owner: User;
  let team: Team;
  let event: Event;
  let speaker: User;
  let service: EventSpeakerInvitations;

  beforeEach(async () => {
    owner = await userFactory({ attributes: { name: 'Alex Organizer' } });
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
    speaker = await userFactory({ attributes: { email: 'speaker@example.com', locale: 'fr' } });
    service = EventSpeakerInvitations.for(
      await getAuthorizedEvent(await getAuthorizedTeam(owner.id, team.slug), event.slug),
    );
  });

  async function invite(message: string | null = 'We would love to hear your talk.\nAre you available?') {
    await service.invite({ email: speaker.email, message });
    return db.eventSpeakerInvitation.findUniqueOrThrow({
      where: { eventId_userId: { eventId: event.id, userId: speaker.id } },
    });
  }

  it('stores and emails a personal message without sharing or linking the speaker profile', async () => {
    const message = 'Hello,\nWe enjoyed your talk <about accessibility>.';
    await service.invite({ email: '  SPEAKER@EXAMPLE.COM  ', message });
    const invitation = await db.eventSpeakerInvitation.findFirstOrThrow();

    expect(invitation).toMatchObject({
      eventId: event.id,
      userId: speaker.id,
      invitedById: owner.id,
      email: speaker.email,
      message,
      status: 'PENDING',
    });
    expect(invitation.expiresAt.getTime() - invitation.createdAt.getTime()).toBeCloseTo(7 * 24 * 60 * 60 * 1000, -3);
    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({
        template: 'speakers-event-invitation',
        to: [speaker.email],
        locale: 'fr',
        data: expect.objectContaining({
          message,
          eventName: event.name,
          teamName: team.name,
          organizerName: owner.name,
          invitationUrl: expect.stringContaining(`/invite/event/${invitation.token}`),
        }),
      }),
    );
    expect(await db.eventSpeaker.count()).toBe(0);
    expect(await db.user.findUnique({ where: { id: speaker.id } })).toEqual(speaker);
    const listed = await service.list();
    expect(listed.invitations[0]).toEqual({
      id: invitation.id,
      email: speaker.email,
      message,
      status: 'PENDING',
      expiresAt: invitation.expiresAt,
    });
  });

  it.each([null, '', '   '])('supports an invitation without a custom message (%s)', async (message) => {
    expect((await invite(message)).message).toBeNull();
    expect(sendEmail.trigger).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ message: null }) }),
    );
  });

  it('enforces the message length before storing or sending an invitation', async () => {
    await expect(invite('x'.repeat(2001))).rejects.toThrow(ZodError);
    expect(await db.eventSpeakerInvitation.count()).toBe(0);
    expect(sendEmail.trigger).not.toHaveBeenCalled();
  });

  it('allows team members to invite speakers', async () => {
    const member = await userFactory();
    await db.teamMember.create({ data: { memberId: member.id, teamId: team.id, role: 'MEMBER' } });
    const memberEvent = await getAuthorizedEvent(await getAuthorizedTeam(member.id, team.slug), event.slug);
    await EventSpeakerInvitations.for(memberEvent).invite({ email: speaker.email, message: null });
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ invitedById: member.id, status: 'PENDING' });
  });

  it('prevents reviewers from reading, sending, resending, or canceling invitations', async () => {
    const invitation = await invite();
    const reviewer = await userFactory();
    await db.teamMember.create({ data: { memberId: reviewer.id, teamId: team.id, role: 'REVIEWER' } });
    const reviewerEvent = await getAuthorizedEvent(await getAuthorizedTeam(reviewer.id, team.slug), event.slug);
    const denied = EventSpeakerInvitations.for(reviewerEvent);
    await expect(denied.list()).rejects.toThrow(ForbiddenOperationError);
    await expect(denied.invite({ email: speaker.email, message: null })).rejects.toThrow(ForbiddenOperationError);
    await expect(denied.resend(invitation.id)).rejects.toThrow(ForbiddenOperationError);
    await expect(denied.cancel(invitation.id)).rejects.toThrow(ForbiddenOperationError);
  });

  it.each([
    ['missing@example.com', UserNotFoundError],
    ['speaker', ZodError],
  ] as const)('does not invite unknown or partial email matches (%s)', async (email, error) => {
    await expect(service.invite({ email, message: null })).rejects.toThrow(error);
    expect(await db.eventSpeakerInvitation.count()).toBe(0);
    expect(sendEmail.trigger).not.toHaveBeenCalled();
  });

  it('does not invite deleted or ambiguously matched accounts', async () => {
    await db.user.update({ where: { id: speaker.id }, data: { deletedAt: new Date() } });
    await expect(invite()).rejects.toThrow(UserNotFoundError);
    await db.user.update({ where: { id: speaker.id }, data: { deletedAt: null } });
    await userFactory({ attributes: { email: speaker.email.toUpperCase() } });
    await expect(invite()).rejects.toThrow(UserNotFoundError);
    expect(sendEmail.trigger).not.toHaveBeenCalled();
  });

  it('does not invite an already linked speaker or merge a manual email conflict', async () => {
    const manual = await eventSpeakerFactory({ event, attributes: { email: speaker.email.toUpperCase() } });
    await expect(invite()).rejects.toThrow(SpeakerEmailAlreadyExistsError);
    expect(await db.eventSpeaker.findUnique({ where: { id: manual.id } })).toEqual(manual);
    await db.eventSpeaker.update({
      where: { id: manual.id },
      data: { userId: speaker.id, email: 'other@example.com' },
    });
    await expect(invite()).rejects.toThrow(SpeakerEmailAlreadyExistsError);
    expect(sendEmail.trigger).not.toHaveBeenCalled();
  });

  it('does not replace a pending invitation or send duplicate invitation emails', async () => {
    const invitation = await invite();
    await expect(invite('Replacement message')).rejects.toThrow(SpeakerInvitationAlreadyExistsError);
    expect(await db.eventSpeakerInvitation.findFirst()).toEqual(invitation);
    expect(sendEmail.trigger).toHaveBeenCalledTimes(1);
  });

  it('creates only one invitation during concurrent requests', async () => {
    const results = await Promise.allSettled([invite(), invite()]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(await db.eventSpeakerInvitation.count()).toBe(1);
    expect(sendEmail.trigger).toHaveBeenCalledTimes(1);
    expect(await db.eventSpeaker.count()).toBe(0);
  });

  it('only reveals the message to the invited account', async () => {
    const invitation = await invite('Private invitation message');
    expect(await EventSpeakerInvitations.getForRecipient(invitation.token!, owner.id)).toBeNull();
    expect(await EventSpeakerInvitations.getForRecipient(invitation.token!, speaker.id)).toMatchObject({
      message: 'Private invitation message',
    });
    await expect(EventSpeakerInvitations.respond(invitation.token!, owner.id, 'accept')).rejects.toThrow(
      InvitationInvalidOrAccepted,
    );
    expect(await db.eventSpeaker.count()).toBe(0);
  });

  it('copies the current account profile only when the recipient accepts', async () => {
    const invitation = await invite();
    const updatedUser = await db.user.update({
      where: { id: speaker.id },
      data: { bio: 'Current biography', name: 'Current name' },
    });
    await EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'accept');

    expect(await db.eventSpeaker.findFirst()).toMatchObject({
      userId: speaker.id,
      eventId: event.id,
      email: speaker.email,
      name: updatedUser.name,
      bio: updatedUser.bio,
      picture: speaker.picture,
      company: speaker.company,
      location: speaker.location,
      references: speaker.references,
      socialLinks: speaker.socialLinks,
      locale: 'fr',
    });
    expect(await db.user.findUnique({ where: { id: speaker.id } })).toEqual(updatedUser);
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'ACCEPTED', token: null });
    expect(await db.proposal.count()).toBe(0);
    await expect(EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'accept')).rejects.toThrow(
      InvitationInvalidOrAccepted,
    );
  });

  it('preserves organizer edits if the speaker joined the event while an invitation was pending', async () => {
    const invitation = await invite();
    const existing = await eventSpeakerFactory({
      event,
      user: speaker,
      attributes: { bio: 'Event biography', email: 'event@example.com' },
    });
    await EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'accept');
    expect(await db.eventSpeaker.findMany()).toEqual([existing]);
  });

  it('keeps a conflicted acceptance pending so it can be retried after the organizer resolves it', async () => {
    const invitation = await invite();
    const manual = await eventSpeakerFactory({ event, attributes: { email: speaker.email } });
    await expect(EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'accept')).rejects.toThrow(
      SpeakerEmailAlreadyExistsError,
    );
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'PENDING', token: invitation.token });
    expect(await db.eventSpeaker.findMany()).toEqual([manual]);
    await db.eventSpeaker.delete({ where: { id: manual.id } });
    await EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'accept');
    expect(await db.eventSpeaker.count()).toBe(1);
  });

  it('declines without creating a speaker and does not allow organizers to resend a declined invitation', async () => {
    const invitation = await invite();
    await EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'decline');
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'DECLINED', token: null });
    expect(await db.eventSpeaker.count()).toBe(0);
    await expect(service.resend(invitation.id)).rejects.toThrow(InvitationInvalidOrAccepted);
    await expect(invite()).rejects.toThrow(SpeakerInvitationAlreadyExistsError);
  });

  it('consumes an invitation once when accept and decline happen concurrently', async () => {
    const invitation = await invite();
    const results = await Promise.allSettled([
      EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'accept'),
      EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'decline'),
    ]);
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    const stored = await db.eventSpeakerInvitation.findFirstOrThrow();
    expect(stored.token).toBeNull();
    expect(await db.eventSpeaker.count()).toBe(stored.status === 'ACCEPTED' ? 1 : 0);
  });

  it('expires invitations and displays their expired status to organizers', async () => {
    const invitation = await invite();
    await db.eventSpeakerInvitation.update({
      where: { id: invitation.id },
      data: { expiresAt: new Date(Date.now() - 1000) },
    });
    expect(await EventSpeakerInvitations.getForRecipient(invitation.token!, speaker.id)).toBeNull();
    await expect(EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'accept')).rejects.toThrow(
      InvitationInvalidOrAccepted,
    );
    expect((await service.list()).invitations[0].status).toBe('EXPIRED');
    expect(await db.eventSpeaker.count()).toBe(0);
  });

  it('resends the same personal message with a new single-use link and renewed expiration', async () => {
    const invitation = await invite();
    await db.eventSpeakerInvitation.update({ where: { id: invitation.id }, data: { expiresAt: new Date(0) } });
    await service.resend(invitation.id);
    const resent = await db.eventSpeakerInvitation.findFirstOrThrow();
    expect(resent.token).not.toBe(invitation.token);
    expect(resent.message).toBe(invitation.message);
    expect(resent.expiresAt.getTime()).toBeGreaterThan(Date.now());
    expect(await EventSpeakerInvitations.getForRecipient(invitation.token!, speaker.id)).toBeNull();
    expect(sendEmail.trigger).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          message: invitation.message,
          invitationUrl: expect.stringContaining(resent.token!),
        }),
      }),
    );
  });

  it('cancels an invitation and invalidates its link', async () => {
    const invitation = await invite();
    await service.cancel(invitation.id);
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'CANCELED', token: null });
    await expect(EventSpeakerInvitations.respond(invitation.token!, speaker.id, 'accept')).rejects.toThrow(
      InvitationInvalidOrAccepted,
    );
    const replacement = await invite('A new personal message');
    expect(replacement.token).not.toBe(invitation.token);
    expect(replacement.message).toBe('A new personal message');
    expect(await db.eventSpeaker.count()).toBe(0);
  });

  it('does not let an organizer manage invitations from another event', async () => {
    const invitation = await invite();
    const otherEvent = await eventFactory({ team });
    const otherService = EventSpeakerInvitations.for(
      await getAuthorizedEvent(await getAuthorizedTeam(owner.id, team.slug), otherEvent.slug),
    );
    await expect(otherService.resend(invitation.id)).rejects.toThrow(InvitationInvalidOrAccepted);
    await expect(otherService.cancel(invitation.id)).rejects.toThrow(InvitationInvalidOrAccepted);
    expect((await otherService.list()).invitations).toEqual([]);
  });

  it('removes received invitations and their email addresses when the account is deleted', async () => {
    const invitation = await invite();
    await UserAccount.for(speaker.id).deleteAccount({ sendConfirmationEmail: false });
    expect(await db.eventSpeakerInvitation.count()).toBe(0);
    expect(await EventSpeakerInvitations.getForRecipient(invitation.token!, speaker.id)).toBeNull();
  });

  it('invalidates an invitation on enqueue failure and allows a fresh retry', async () => {
    vi.mocked(sendEmail.trigger).mockRejectedValueOnce(new Error('Queue unavailable'));
    await expect(invite()).rejects.toThrow(SpeakerInvitationDeliveryError);
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'CANCELED', token: null });
    await invite('Retry message');
    expect(await db.eventSpeakerInvitation.findFirst()).toMatchObject({ status: 'PENDING', message: 'Retry message' });
    expect(await db.eventSpeaker.count()).toBe(0);
  });
});
