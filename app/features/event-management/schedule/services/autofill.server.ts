import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ForbiddenOperationError, NotFoundError } from '~/shared/errors.server.ts';
import type { Language, Languages } from '~/shared/types/proposals.types.ts';
import { db, type DbTransaction } from '../../../../../prisma/db.server.ts';
import type { Event } from '../../../../../prisma/generated/client.ts';
import { type AutofillPayload, type AutofillReport, type AutofillScope, autofill } from '../models/autofill.ts';
import { categoryColor } from '../models/category-color.ts';
import { ScheduleTime } from '../models/schedule-time.ts';

type SessionAssignment = {
  sessionId: string;
  proposalId: string;
  language: Language | null;
  color: string | null;
};

export class ScheduleAutofill {
  private constructor(private event: Event) {}

  static for(authorizedEvent: AuthorizedEvent) {
    const { event, permissions } = authorizedEvent;
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();
    if (!permissions.canEditEventSchedule) throw new ForbiddenOperationError();
    return new ScheduleAutofill(event);
  }

  async get(): Promise<AutofillPayload> {
    const schedule = await this.scheduleWithSessions(db);
    if (!schedule) throw new NotFoundError('Schedule not found');

    const proposals = await this.eligibleProposals(db);
    return toPayload(schedule, proposals);
  }

  async run(scope: AutofillScope): Promise<AutofillReport> {
    return db.$transaction(async (trx) => {
      const schedule = await this.scheduleWithSessions(trx);
      if (!schedule) throw new NotFoundError('Schedule not found');

      const proposals = await this.eligibleProposals(trx);
      const report = autofill(toPayload(schedule, proposals), scope);

      if (report.sessionsToClear.length > 0) {
        await trx.scheduleSession.updateMany({
          where: { id: { in: report.sessionsToClear }, scheduleId: schedule.id },
          data: { proposalId: null, language: null, color: null },
        });
      }

      const languages = new Map(proposals.map((p) => [p.id, (p.languages as Languages).at(0) ?? null]));
      const colors = new Map(proposals.map((p) => [p.id, categoryColor(p.categories)]));
      const assignments: Array<SessionAssignment> = report.assignments.map(({ sessionId, proposalId }) => ({
        sessionId,
        proposalId,
        language: languages.get(proposalId) ?? null,
        color: colors.get(proposalId) ?? null,
      }));

      for (const { sessionId, proposalId, language, color } of assignments) {
        await trx.scheduleSession.update({
          where: { id: sessionId, scheduleId: schedule.id },
          // An uncoloured category leaves the session's own colour alone.
          data: { proposalId, language, ...(color ? { color } : {}) },
        });
      }

      return report;
    });
  }

  private async scheduleWithSessions(client: DbTransaction) {
    return client.schedule.findFirst({
      where: { eventId: this.event.id },
      include: {
        tracks: true,
        sessions: { include: { proposal: { select: { speakers: { select: { id: true } } } } } },
      },
    });
  }

  private async eligibleProposals(client: DbTransaction) {
    return client.proposal.findMany({
      where: {
        eventId: this.event.id,
        isDraft: false,
        archivedAt: null,
        deliberationStatus: { in: ['PENDING', 'ACCEPTED'] },
        OR: [{ confirmationStatus: null }, { confirmationStatus: { in: ['PENDING', 'CONFIRMED'] } }],
      },
      select: {
        id: true,
        proposalNumber: true,
        languages: true,
        deliberationStatus: true,
        confirmationStatus: true,
        isDraft: true,
        archivedAt: true,
        speakers: { select: { id: true } },
        categories: { select: { color: true }, orderBy: { order: 'asc' }, take: 1 },
      },
    });
  }
}

type ScheduleWithSessions = NonNullable<Awaited<ReturnType<ScheduleAutofill['scheduleWithSessions']>>>;
type EligibleProposals = Awaited<ReturnType<ScheduleAutofill['eligibleProposals']>>;

function toPayload(schedule: ScheduleWithSessions, proposals: EligibleProposals): AutofillPayload {
  const scheduleTime = new ScheduleTime(schedule.timezone);
  const tracks = schedule.tracks
    .toSorted((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
    .map(({ id, name }) => ({ id, name }));

  return {
    days: scheduleTime.dayKeys(schedule.start, schedule.end),
    tracks,
    sessions: schedule.sessions.map((session) => ({
      id: session.id,
      day: scheduleTime.dayKeyOf(session.start),
      trackId: session.trackId,
      start: session.start,
      end: session.end,
      name: session.name,
      proposalId: session.proposalId,
      speakerIds: session.proposal?.speakers.map((speaker) => speaker.id) ?? [],
    })),
    proposals: proposals.map((proposal) => ({
      id: proposal.id,
      number: proposal.proposalNumber,
      speakerIds: proposal.speakers.map((speaker) => speaker.id),
      deliberationStatus: proposal.deliberationStatus,
      confirmationStatus: proposal.confirmationStatus,
      isDraft: proposal.isDraft,
      archivedAt: proposal.archivedAt,
    })),
  };
}
