import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { SpeakerProfile } from '~/features/speaker/settings/services/speaker-profile.server.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError, SpeakerEmailAlreadyExistsError, UserNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event, Team, User } from '../../../../../prisma/generated/client.ts';
import { EventSpeakers } from './event-speakers.server.ts';

describe('EventSpeakers.addExisting', () => {
  let team: Team;
  let event: Event;
  let speaker: User;
  let authorizedEvent: AuthorizedEvent;

  beforeEach(async () => {
    const owner = await userFactory();
    team = await teamFactory({ owners: [owner] });
    event = await eventFactory({ team });
    speaker = await userFactory({ attributes: { email: 'speaker@example.com', locale: 'fr' } });
    const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
    authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
  });

  it('copies the account profile into a linked event speaker without changing the account or other events', async () => {
    const otherEvent = await eventFactory({ team });
    const otherSpeaker = await eventSpeakerFactory({
      event: otherEvent,
      user: speaker,
      attributes: { bio: 'Biography for another event' },
    });

    const added = await EventSpeakers.for(authorizedEvent).addExisting('  SPEAKER@example.com  ');

    expect(added).toMatchObject({
      userId: speaker.id,
      eventId: event.id,
      name: speaker.name,
      email: speaker.email,
      picture: speaker.picture,
      bio: speaker.bio,
      company: speaker.company,
      location: speaker.location,
      references: speaker.references,
      socialLinks: speaker.socialLinks,
      locale: speaker.locale,
    });
    expect(await db.user.findUnique({ where: { id: speaker.id } })).toEqual(speaker);
    expect(await db.eventSpeaker.findUnique({ where: { id: otherSpeaker.id } })).toEqual(otherSpeaker);
    expect(await db.proposal.count({ where: { eventId: event.id } })).toBe(0);
  });

  it('allows team members to add an existing speaker', async () => {
    const member = await userFactory();
    await db.teamMember.create({ data: { memberId: member.id, teamId: team.id, role: 'MEMBER' } });
    const authorizedTeam = await getAuthorizedTeam(member.id, team.slug);
    const memberEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

    const added = await EventSpeakers.for(memberEvent).addExisting(speaker.email);

    expect(added.userId).toBe(speaker.id);
  });

  it('rejects reviewers before adding a speaker', async () => {
    const reviewer = await userFactory();
    await db.teamMember.create({ data: { memberId: reviewer.id, teamId: team.id, role: 'REVIEWER' } });
    const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
    const reviewerEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

    await expect(EventSpeakers.for(reviewerEvent).addExisting(speaker.email)).rejects.toThrow(ForbiddenOperationError);
    expect(await db.eventSpeaker.count()).toBe(0);
  });

  it.each(['missing@example.com', 'speaker', 'example.com'])('does not match an account with %s', async (email) => {
    await expect(EventSpeakers.for(authorizedEvent).addExisting(email)).rejects.toThrow(UserNotFoundError);
    expect(await db.eventSpeaker.count()).toBe(0);
  });

  it('does not add deleted accounts', async () => {
    await db.user.update({ where: { id: speaker.id }, data: { deletedAt: new Date() } });

    await expect(EventSpeakers.for(authorizedEvent).addExisting(speaker.email)).rejects.toThrow(UserNotFoundError);
    expect(await db.eventSpeaker.count()).toBe(0);
  });

  it('does not choose between accounts whose email addresses differ only in case', async () => {
    await userFactory({ attributes: { email: speaker.email.toUpperCase() } });

    await expect(EventSpeakers.for(authorizedEvent).addExisting(speaker.email)).rejects.toThrow(UserNotFoundError);
    expect(await db.eventSpeaker.count()).toBe(0);
  });

  it('reuses the linked speaker and preserves organizer edits, including a different event email', async () => {
    const existing = await eventSpeakerFactory({
      event,
      user: speaker,
      attributes: { name: 'Event name', bio: 'Event biography', email: 'event-contact@example.com' },
    });

    const added = await EventSpeakers.for(authorizedEvent).addExisting(speaker.email);

    expect(added).toEqual(existing);
    expect(await db.eventSpeaker.count({ where: { eventId: event.id } })).toBe(1);
  });

  it.each(['unlinked', 'another account'])('preserves a conflicting event speaker linked to %s', async (link) => {
    const otherUser = link === 'another account' ? await userFactory() : undefined;
    const conflicting = await eventSpeakerFactory({
      event,
      user: otherUser,
      attributes: { email: speaker.email.toUpperCase(), bio: 'Organizer biography' },
    });

    await expect(EventSpeakers.for(authorizedEvent).addExisting(speaker.email)).rejects.toThrow(
      SpeakerEmailAlreadyExistsError,
    );

    expect(await db.eventSpeaker.findMany({ where: { eventId: event.id } })).toEqual([conflicting]);
  });

  it('returns one linked speaker when additions happen concurrently', async () => {
    const service = EventSpeakers.for(authorizedEvent);

    const [first, second] = await Promise.all([
      service.addExisting(speaker.email),
      service.addExisting(speaker.email.toUpperCase()),
    ]);

    expect(first.id).toBe(second.id);
    expect(await db.eventSpeaker.count({ where: { eventId: event.id, userId: speaker.id } })).toBe(1);
  });

  it('receives subsequent profile updates from the linked speaker account', async () => {
    const added = await EventSpeakers.for(authorizedEvent).addExisting(speaker.email);

    await SpeakerProfile.for(speaker.id).save({ bio: 'Updated account biography' });

    expect(await db.eventSpeaker.findUnique({ where: { id: added.id } })).toMatchObject({
      userId: speaker.id,
      bio: 'Updated account biography',
    });
  });
});
