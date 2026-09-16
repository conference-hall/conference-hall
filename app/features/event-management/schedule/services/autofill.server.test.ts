import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { scheduleTrackFactory } from 'tests/factories/schedule-track.ts';
import { scheduleFactory } from 'tests/factories/schedule.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError, NotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event, Schedule, ScheduleTrack, Team, User } from '../../../../../prisma/generated/client.ts';
import { Prisma } from '../../../../../prisma/generated/client.ts';
import type { AutofillScope } from '../models/autofill.ts';
import { autofill } from '../models/autofill.ts';
import { ScheduleAutofill } from './autofill.server.ts';
import { EventSchedule } from './schedule.server.ts';

vi.mock('../models/autofill.ts', { spy: true });

const DAY_1 = '2024-10-05';
const DAY_2 = '2024-10-06';

const at = (hours: number, day = DAY_1) => new Date(`${day}T${String(hours).padStart(2, '0')}:00:00.000Z`);

describe('ScheduleAutofill', () => {
  let owner: User;
  let reviewer: User;
  let speaker: User;
  let team: Team;
  let event: Event;
  let schedule: Schedule;
  let track: ScheduleTrack;
  let track2: ScheduleTrack;

  beforeEach(async () => {
    owner = await userFactory();
    reviewer = await userFactory();
    speaker = await userFactory();
    team = await teamFactory({ owners: [owner], reviewers: [reviewer] });
    event = await eventFactory({ team, traits: ['conference'] });
    schedule = await scheduleFactory({ event });
    track = await scheduleTrackFactory({ name: 'Room 1', schedule });
    track2 = await scheduleTrackFactory({ name: 'Room 2', schedule });
  });

  const authorizedEvent = async (user: User = owner, eventSlug: string = event.slug) => {
    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
    return getAuthorizedEvent(authorizedTeam, eventSlug);
  };

  const acceptedProposal = async (options: { languages?: Array<string>; speakers?: Array<User> } = {}) => {
    const talk = await talkFactory({ speakers: options.speakers ?? [speaker] });
    return proposalFactory({
      event,
      talk,
      traits: ['accepted'],
      attributes: { languages: options.languages ?? ['fr', 'en'] },
    });
  };

  const addSession = async (data: { trackId: string; start: Date; end: Date; name?: string; proposalId?: string }) => {
    const ctx = await authorizedEvent();
    return EventSchedule.for(ctx).addSession(data);
  };

  const scopeOf = (overrides: Partial<AutofillScope> = {}): AutofillScope => ({
    days: [DAY_1, DAY_2],
    trackIds: [track.id, track2.id],
    proposalState: 'accepted',
    reset: false,
    ...overrides,
  });

  describe('ScheduleAutofill.for', () => {
    it('returns a ScheduleAutofill instance', async () => {
      const ctx = await authorizedEvent();

      expect(ScheduleAutofill.for(ctx)).toBeInstanceOf(ScheduleAutofill);
    });

    it('throws forbidden error for reviewers', async () => {
      const ctx = await authorizedEvent(reviewer);

      expect(() => ScheduleAutofill.for(ctx)).toThrow(ForbiddenOperationError);
    });

    it('throws forbidden error for meetups', async () => {
      const meetup = await eventFactory({ team, traits: ['meetup'] });
      const ctx = await authorizedEvent(owner, meetup.slug);

      expect(() => ScheduleAutofill.for(ctx)).toThrow(ForbiddenOperationError);
    });
  });

  describe('#get', () => {
    it('throws not found error when the event has no schedule', async () => {
      const eventWithoutSchedule = await eventFactory({ team, traits: ['conference'] });
      const ctx = await authorizedEvent(owner, eventWithoutSchedule.slug);

      await expect(ScheduleAutofill.for(ctx).get()).rejects.toThrow(NotFoundError);
    });

    it('returns the schedule days and its tracks in creation order', async () => {
      const payload = await ScheduleAutofill.for(await authorizedEvent()).get();

      expect(payload.days).toEqual([DAY_1, DAY_2]);
      expect(payload.tracks).toEqual([
        { id: track.id, name: 'Room 1' },
        { id: track2.id, name: 'Room 2' },
      ]);
    });

    it('returns the sessions with the speaker ids of their proposal', async () => {
      const proposal = await acceptedProposal();
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10), proposalId: proposal.id });
      const speakers = await db.eventSpeaker.findMany({ where: { proposals: { some: { id: proposal.id } } } });

      const payload = await ScheduleAutofill.for(await authorizedEvent()).get();

      expect(payload.sessions).toEqual([
        {
          id: session.id,
          day: DAY_1,
          trackId: track.id,
          start: at(9),
          end: at(10),
          name: null,
          proposalId: proposal.id,
          speakerIds: speakers.map((s) => s.id),
        },
      ]);
    });

    it('returns the day of a session in the schedule timezone', async () => {
      await addSession({ trackId: track.id, start: at(23, DAY_1), end: at(23, DAY_1) });

      const payload = await ScheduleAutofill.for(await authorizedEvent()).get();

      expect(payload.sessions.at(0)?.day).toBe(DAY_2);
    });

    it('excludes rejected, declined, draft and archived proposals', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const accepted = await acceptedProposal();
      await proposalFactory({ event, talk, traits: ['rejected'] });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }), traits: ['declined'] });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }), traits: ['draft'] });
      await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker] }), traits: ['archived'] });

      const payload = await ScheduleAutofill.for(await authorizedEvent()).get();

      expect(payload.proposals.map((p) => p.id)).toEqual([accepted.id]);
    });

    it('keeps a proposal still in deliberation, whose confirmation status is null', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const pending = await proposalFactory({ event, talk });

      const payload = await ScheduleAutofill.for(await authorizedEvent()).get();

      expect(payload.proposals).toEqual([
        expect.objectContaining({ id: pending.id, deliberationStatus: 'PENDING', confirmationStatus: null }),
      ]);
    });
  });

  describe('#run', () => {
    it('writes the proposal and the language of its first language on a vacant session', async () => {
      const proposal = await acceptedProposal({ languages: ['fr', 'en'] });
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10) });

      const report = await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf());

      expect(report.assignments).toEqual([{ sessionId: session.id, proposalId: proposal.id }]);
      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved?.proposalId).toBe(proposal.id);
      expect(saved?.language).toBe('fr');
    });

    it('leaves the name, color and emojis of a filled session untouched', async () => {
      await acceptedProposal();
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10) });
      await db.scheduleSession.update({ where: { id: session.id }, data: { color: 'pink', emojis: ['fire'] } });

      await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf());

      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved).toMatchObject({ name: null, color: 'pink', emojis: ['fire'] });
    });

    it('skips a session already filled, never overwrites it', async () => {
      const scheduled = await acceptedProposal();
      const candidate = await acceptedProposal({ speakers: [await userFactory()] });
      const session = await addSession({
        trackId: track.id,
        start: at(9),
        end: at(10),
        proposalId: scheduled.id,
      });

      const report = await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf());

      expect(report.assignments).toEqual([]);
      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved?.proposalId).toBe(scheduled.id);
      expect(report.proposalsLeftUnscheduled).toEqual([{ proposalId: candidate.id, reason: 'no-vacant-session' }]);
    });

    it('never fills a session carrying a name', async () => {
      await acceptedProposal();
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10), name: 'Lunch break' });

      await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf());

      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved?.proposalId).toBe(null);
      expect(saved?.name).toBe('Lunch break');
    });

    it('never schedules a proposal declined by its speaker', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      await proposalFactory({ event, talk, traits: ['declined'] });
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10) });

      const report = await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf());

      expect(report.sessionsLeftVacant).toEqual([session.id]);
      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved?.proposalId).toBe(null);
    });

    it('schedules a proposal still in deliberation when the scope asks for all the proposals', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const pending = await proposalFactory({ event, talk });
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10) });

      const report = await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf({ proposalState: 'all' }));

      expect(report.assignments).toEqual([{ sessionId: session.id, proposalId: pending.id }]);
    });
  });

  describe('#run with autofill reset', () => {
    it('clears the filled sessions of the scope and refills them in the same pass', async () => {
      const proposal = await acceptedProposal();
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10), proposalId: proposal.id });

      const report = await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf({ reset: true }));

      expect(report.sessionsToClear).toEqual([session.id]);
      expect(report.assignments).toEqual([{ sessionId: session.id, proposalId: proposal.id }]);
    });

    it('clears a session left without a candidate and keeps its name, color and emojis', async () => {
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk, traits: ['accepted'] });
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10), proposalId: proposal.id });
      await db.scheduleSession.update({ where: { id: session.id }, data: { color: 'pink', emojis: ['fire'] } });
      await db.proposal.update({ where: { id: proposal.id }, data: { deliberationStatus: 'REJECTED' } });

      await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf({ reset: true }));

      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved).toMatchObject({ proposalId: null, language: null, color: 'pink', emojis: ['fire'] });
    });

    it('spares a session outside the scope', async () => {
      const proposal = await acceptedProposal();
      const session = await addSession({ trackId: track2.id, start: at(9), end: at(10), proposalId: proposal.id });

      await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf({ trackIds: [track.id], reset: true }));

      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved?.proposalId).toBe(proposal.id);
    });

    it('spares a session carrying a name', async () => {
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10), name: 'Lunch break' });

      const report = await ScheduleAutofill.for(await authorizedEvent()).run(scopeOf({ reset: true }));

      expect(report.sessionsToClear).toEqual([]);
      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved?.name).toBe('Lunch break');
    });

    it('leaves the schedule untouched when a write fails', async () => {
      const proposal = await acceptedProposal();
      const session = await addSession({ trackId: track.id, start: at(9), end: at(10), proposalId: proposal.id });

      vi.mocked(autofill).mockReturnValueOnce({
        assignments: [{ sessionId: 'unknown-session', proposalId: proposal.id }],
        sessionsLeftVacant: [],
        proposalsLeftUnscheduled: [],
        sessionsToClear: [session.id],
      });

      await expect(ScheduleAutofill.for(await authorizedEvent()).run(scopeOf({ reset: true }))).rejects.toThrow(
        Prisma.PrismaClientKnownRequestError,
      );

      const saved = await db.scheduleSession.findUnique({ where: { id: session.id } });
      expect(saved?.proposalId).toBe(proposal.id);
    });
  });
});
