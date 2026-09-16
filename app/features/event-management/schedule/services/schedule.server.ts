import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { isHexColor } from '~/shared/colors/colors.ts';
import {
  ForbiddenOperationError,
  NotFoundError,
  ProposalNotFoundError,
  ScheduleTrackNotFoundError,
  ScheduleTrackRequiredError,
  SessionConflictError,
} from '~/shared/errors.server.ts';
import type { Language, Languages } from '~/shared/types/proposals.types.ts';
import { db, type DbTransaction } from '../../../../../prisma/db.server.ts';
import type { Event, Proposal, ScheduleSession, ScheduleTrack } from '../../../../../prisma/generated/client.ts';
import { SessionPlacement } from '../models/session-placement.ts';
import type {
  ScheduleCreateData,
  ScheduleDisplayTimesUpdateData,
  ScheduleSessionCreateData,
  ScheduleSessionUpdateData,
  ScheduleTracksSaveData,
} from './schedule.schema.server.ts';

export class EventSchedule {
  private constructor(private event: Event) {}

  static for(authorizedEvent: AuthorizedEvent) {
    const { event, permissions } = authorizedEvent;
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
    if (!permissions.canEditEventSchedule) throw new ForbiddenOperationError();
    return new EventSchedule(event);
  }

  private async schedule(client: DbTransaction = db) {
    const schedule = await client.schedule.findFirst({
      where: { eventId: this.event.id },
      include: { tracks: true },
    });
    if (!schedule) throw new NotFoundError('Schedule not found');
    return schedule;
  }

  private async scheduleWithSessions(client: DbTransaction) {
    const schedule = await client.schedule.findFirst({
      where: { eventId: this.event.id },
      include: { tracks: true, sessions: true },
    });
    if (!schedule) throw new NotFoundError('Schedule not found');
    return schedule;
  }

  async get() {
    const schedule = await db.schedule.findFirst({ where: { eventId: this.event.id }, include: { tracks: true } });
    if (!schedule) return null;

    return {
      id: schedule.id,
      name: schedule.name,
      timezone: schedule.timezone,
      start: schedule.start,
      end: schedule.end,
      tracks: toScheduleTracks(schedule.tracks),
    };
  }

  async create(data: ScheduleCreateData) {
    await db.schedule.create({
      data: {
        name: data.name,
        timezone: data.timezone,
        start: data.start,
        end: data.end,
        displayStartMinutes: 9 * 60,
        displayEndMinutes: 18 * 60,
        tracks: { create: { name: 'Main stage' } },
        event: { connect: { id: this.event.id } },
      },
    });
  }

  async update(data: ScheduleDisplayTimesUpdateData) {
    const schedule = await this.schedule();

    await db.schedule.update({ data, where: { id: schedule.id } });
  }

  async delete() {
    const schedule = await this.schedule();

    await db.schedule.delete({ where: { id: schedule.id } });
  }

  private async prepareSession(data: ScheduleSessionCreateData, client: DbTransaction, placedSessionId?: string) {
    const schedule = await this.scheduleWithSessions(client);

    if (!schedule.tracks.some((track) => track.id === data.trackId)) throw new ScheduleTrackNotFoundError();

    const proposal = data.proposalId ? await this.eventProposal(data.proposalId, client) : null;

    const outcome = placementFor(schedule.sessions).place(
      { trackId: data.trackId, timeslot: { start: data.start, end: data.end } },
      placedSessionId,
    );
    if (outcome.status === 'conflict') throw new SessionConflictError();

    const row = {
      trackId: outcome.placement.trackId,
      start: outcome.placement.timeslot.start,
      end: outcome.placement.timeslot.end,
      color: data.color ?? null,
      name: !data.proposalId ? (data.name ?? null) : null,
      proposalId: data.proposalId ? data.proposalId : null,
      emojis: data.emojis ?? [],
      language: sessionLanguage(data.language, proposal),
    };

    return { schedule, row };
  }

  async addSession(data: ScheduleSessionCreateData) {
    return db.$transaction(async (trx) => {
      const { schedule, row } = await this.prepareSession(data, trx);

      return trx.scheduleSession.create({ data: { ...row, scheduleId: schedule.id } });
    });
  }

  async updateSession(data: ScheduleSessionUpdateData) {
    return db.$transaction(async (trx) => {
      const { schedule, row } = await this.prepareSession(data, trx, data.id);

      return trx.scheduleSession.update({ data: row, where: { id: data.id, scheduleId: schedule.id } });
    });
  }

  async switchSessions(sourceId: string, targetId: string) {
    await db.$transaction(async (trx) => {
      const schedule = await this.scheduleWithSessions(trx);

      const source = schedule.sessions.find((session) => session.id === sourceId);
      const target = schedule.sessions.find((session) => session.id === targetId);
      if (!source || !target) throw new NotFoundError('Schedule session not found');

      const outcome = placementFor(schedule.sessions).swap(toPlacedSession(source), toPlacedSession(target));
      if (outcome.status === 'conflict') throw new SessionConflictError();

      await trx.scheduleSession.update({
        data: {
          trackId: outcome.source.trackId,
          start: outcome.source.timeslot.start,
          end: outcome.source.timeslot.end,
        },
        where: { id: source.id },
      });
      await trx.scheduleSession.update({
        data: {
          trackId: outcome.target.trackId,
          start: outcome.target.timeslot.start,
          end: outcome.target.timeslot.end,
        },
        where: { id: target.id },
      });
    });
  }

  private async eventProposal(proposalId: string, client: DbTransaction) {
    const proposal = await client.proposal.findFirst({ where: { id: proposalId, eventId: this.event.id } });
    if (!proposal) throw new ProposalNotFoundError();
    return proposal;
  }

  async deleteSession(sessionId: string) {
    const schedule = await this.schedule();
    if (!sessionId) return;
    await db.scheduleSession.deleteMany({ where: { id: sessionId, scheduleId: schedule.id } });
  }

  async saveTracks(tracks: ScheduleTracksSaveData['tracks']) {
    await db.$transaction(async (trx) => {
      const schedule = await this.schedule(trx);

      const keptIds = tracks.map((track) => track.id).filter((id) => id !== undefined);
      if (keptIds.some((id) => !schedule.tracks.some((track) => track.id === id))) {
        throw new ScheduleTrackNotFoundError();
      }

      if (tracks.length === 0) throw new ScheduleTrackRequiredError();

      const deletedIds = schedule.tracks.filter((track) => !keptIds.includes(track.id)).map((track) => track.id);
      if (deletedIds.length > 0) {
        await trx.scheduleTrack.deleteMany({ where: { id: { in: deletedIds }, scheduleId: schedule.id } });
      }

      for (const track of tracks) {
        if (track.id) {
          await trx.scheduleTrack.updateMany({
            where: { id: track.id, scheduleId: schedule.id },
            data: { name: track.name },
          });
        } else {
          await trx.scheduleTrack.create({ data: { name: track.name, scheduleId: schedule.id } });
        }
      }
    });
  }

  async getScheduleSessions() {
    const schedule = await db.schedule.findFirst({
      where: { eventId: this.event.id },
      include: { tracks: true, sessions: { include: { proposal: { include: { speakers: true } } } } },
    });
    if (!schedule) return null;

    return {
      name: schedule.name,
      start: schedule.start,
      end: schedule.end,
      timezone: schedule.timezone,
      displayStartMinutes: schedule.displayStartMinutes,
      displayEndMinutes: schedule.displayEndMinutes,
      tracks: toScheduleTracks(schedule.tracks),
      sessions: schedule.sessions.map(({ id, trackId, start, end, name, language, color, emojis, proposal }) => ({
        id: id,
        trackId: trackId,
        start: start,
        end: end,
        name: name,
        language: language as Language | null,
        emojis: emojis,
        // A row the hex backfill has not converted yet reads as "no colour" rather than reaching
        // the client, where it would fail the hex schema on the next write.
        color: isHexColor(color) ? color : null,
        proposal: proposal
          ? {
              id: proposal.id,
              routeId: proposal.routeId,
              title: proposal.title,
              speakers: proposal.speakers.map((s) => ({ name: s.name, picture: s.picture })),
            }
          : null,
      })),
    };
  }
}

function toScheduleTracks(tracks: Array<ScheduleTrack>) {
  return tracks
    .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map((t) => ({ id: t.id, name: t.name }));
}

function toPlacedSession({ id, trackId, start, end }: ScheduleSession) {
  return { id, trackId, timeslot: { start, end } };
}

function placementFor(sessions: Array<ScheduleSession>) {
  return new SessionPlacement(sessions.map(toPlacedSession));
}

function sessionLanguage(language: string | undefined, proposal: Proposal | null): Language | null {
  if (language) return language as Language;
  if (!proposal) return null;
  return (proposal.languages as Languages).at(0) ?? null;
}
