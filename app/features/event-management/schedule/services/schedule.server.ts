import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import {
  ForbiddenError,
  ForbiddenOperationError,
  NotFoundError,
  ProposalNotFoundError,
  ScheduleTrackNotFoundError,
  SessionConflictError,
} from '~/shared/errors.server.ts';
import type { Language, Languages } from '~/shared/types/proposals.types.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event, Proposal } from '../../../../../prisma/generated/client.ts';
import type { ScheduleCreateInput } from '../../../../../prisma/generated/models.ts';
import type {
  ScheduleCreateData,
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

  private async schedule() {
    const schedule = await db.schedule.findFirst({ where: { eventId: this.event.id }, include: { tracks: true } });
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
      tracks: schedule.tracks
        .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
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

  async update(data: Partial<ScheduleCreateInput>) {
    const schedule = await this.schedule();

    await db.schedule.update({ data, where: { id: schedule.id } });
  }

  async delete() {
    const schedule = await this.schedule();

    await db.schedule.delete({ where: { id: schedule.id } });
  }

  async addSession(data: ScheduleSessionCreateData) {
    const schedule = await this.schedule();

    if (!schedule.tracks.some((track) => track.id === data.trackId)) throw new ScheduleTrackNotFoundError();

    const proposal = data.proposalId ? await this.eventProposal(data.proposalId) : null;

    await this.assertNoSessionConflict(data.trackId, data.start, data.end);

    return db.scheduleSession.create({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
        color: data.color ?? 'gray',
        name: !data.proposalId ? (data.name ?? null) : null,
        proposalId: data.proposalId ? data.proposalId : null,
        emojis: data.emojis ?? [],
        language: sessionLanguage(data.language, proposal),
        scheduleId: schedule.id,
      },
    });
  }

  async updateSession(data: ScheduleSessionUpdateData) {
    const schedule = await this.schedule();

    if (!schedule.tracks.some((track) => track.id === data.trackId)) throw new ScheduleTrackNotFoundError();

    const proposal = data.proposalId ? await this.eventProposal(data.proposalId) : null;

    await this.assertNoSessionConflict(data.trackId, data.start, data.end, data.id);

    return db.scheduleSession.update({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
        color: data.color ?? 'gray',
        name: !data.proposalId ? (data.name ?? null) : null,
        proposalId: data.proposalId ? data.proposalId : null,
        emojis: data.emojis ?? [],
        language: sessionLanguage(data.language, proposal),
      },
      where: { id: data.id, scheduleId: schedule.id },
    });
  }

  async switchSessions(sourceId: string, targetId: string) {
    const schedule = await this.schedule();

    const sessions = await db.scheduleSession.findMany({
      where: { id: { in: [sourceId, targetId] }, scheduleId: schedule.id },
    });
    const source = sessions.find((session) => session.id === sourceId);
    const target = sessions.find((session) => session.id === targetId);
    if (!source || !target) throw new NotFoundError('Schedule session not found');

    await db.$transaction([
      db.scheduleSession.update({
        data: { trackId: target.trackId, start: target.start, end: target.end },
        where: { id: source.id },
      }),
      db.scheduleSession.update({
        data: { trackId: source.trackId, start: source.start, end: source.end },
        where: { id: target.id },
      }),
    ]);
  }

  private async eventProposal(proposalId: string) {
    const proposal = await db.proposal.findFirst({ where: { id: proposalId, eventId: this.event.id } });
    if (!proposal) throw new ProposalNotFoundError();
    return proposal;
  }

  // A Session conflict is another Session of the same Track whose time slot overlaps the given one.
  private async assertNoSessionConflict(trackId: string, start: Date, end: Date, sessionId?: string) {
    const conflict = await db.scheduleSession.findFirst({
      where: {
        trackId,
        start: { lt: end },
        end: { gt: start },
        ...(sessionId ? { id: { not: sessionId } } : {}),
      },
    });
    if (conflict) throw new SessionConflictError();
  }

  async deleteSession(sessionId: string) {
    const schedule = await this.schedule();

    if (!sessionId) return; // sessionId checked and deleteMany to avoid "Record to delete does not exist"
    await db.scheduleSession.deleteMany({ where: { id: sessionId, scheduleId: schedule.id } });
  }

  async saveTracks(tracks: ScheduleTracksSaveData['tracks']) {
    const schedule = await this.schedule();

    const deletedTracks = schedule.tracks.filter((t) => !tracks.find((ut) => ut.id === t.id));

    if (schedule.tracks.length - deletedTracks.length <= 0) {
      throw new ForbiddenError('You must have at least one track defined');
    } else if (deletedTracks.length > 0) {
      await db.scheduleTrack.deleteMany({ where: { id: { in: deletedTracks.map((t) => t.id) } } });
    }

    for (const track of tracks) {
      if (track.id.startsWith('NEW')) {
        await db.scheduleTrack.create({ data: { name: track.name, schedule: { connect: { id: schedule.id } } } });
      } else {
        await db.scheduleTrack.update({ where: { id: track.id }, data: { name: track.name } });
      }
    }
  }

  async getScheduleSessions() {
    const schedule = await db.schedule.findFirst({
      where: { eventId: this.event.id },
      include: { tracks: true, sessions: true },
    });
    if (!schedule) return null;

    const sessions = await db.scheduleSession.findMany({
      where: { scheduleId: schedule.id },
      include: { proposal: { include: { speakers: true } } },
    });

    return {
      name: schedule.name,
      start: schedule.start,
      end: schedule.end,
      timezone: schedule.timezone,
      displayStartMinutes: schedule.displayStartMinutes,
      displayEndMinutes: schedule.displayEndMinutes,
      tracks: schedule.tracks
        .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
      sessions: sessions.map(({ id, trackId, start, end, name, language, color, emojis, proposal }) => ({
        id: id,
        trackId: trackId,
        start: start,
        end: end,
        name: name,
        language: language as Language | null,
        emojis: emojis,
        color: color,
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

function sessionLanguage(language: string | undefined, proposal: Proposal | null): Language | null {
  if (language) return language as Language;
  if (!proposal) return null;
  return (proposal.languages as Languages).at(0) ?? null;
}
