import type { EventType, Prisma } from '@prisma/client';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { db } from 'prisma/db.server.ts';
import xss from 'xss';
import { formatTimeDifference, getDatesRange } from '~/libs/datetimes/datetimes.ts';
import { utcToTimezone } from '~/libs/datetimes/timezone.ts';
import {
  ApiKeyInvalidError,
  EventNotFoundError,
  ForbiddenError,
  ForbiddenOperationError,
  NotFoundError,
} from '~/libs/errors.server.ts';
import { flags } from '~/libs/feature-flags/flags.server.ts';
import { SESSION_COLORS } from '~/routes/team+/$team.$event+/schedule+/components/session/constants.ts';
import type { Language, Languages } from '~/types/proposals.types.ts';
import { EventIntegrations } from '../event-settings/event-integrations.ts';
import { UserEvent } from '../event-settings/user-event.ts';
import {
  type ScheduleCreateData,
  ScheduleGenerationResultSchema,
  type ScheduleIAGenerateData,
  type ScheduleSessionCreateData,
  type ScheduleSessionUpdateData,
  type ScheduleTracksSaveData,
} from './event-schedule.types.ts';

export class EventSchedule {
  constructor(
    private eventSlug: string,
    private userEvent: UserEvent,
  ) {}

  static for(userId: string, teamSlug: string, eventSlug: string) {
    const userEvent = UserEvent.for(userId, teamSlug, eventSlug);
    return new EventSchedule(eventSlug, userEvent);
  }

  async get() {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id }, include: { tracks: true } });
    if (!schedule) return null;

    return {
      id: schedule.id,
      name: schedule.name,
      timezone: schedule.timezone,
      start: schedule.start,
      end: schedule.end,
      tracks: [...schedule.tracks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((t) => ({ id: t.id, name: t.name })),
    };
  }

  async create(data: ScheduleCreateData) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    await db.schedule.create({
      data: {
        name: data.name,
        timezone: data.timezone,
        start: data.start,
        end: data.end,
        displayStartMinutes: 9 * 60,
        displayEndMinutes: 18 * 60,
        tracks: { create: { name: 'Main stage' } },
        event: { connect: { slug: this.eventSlug } },
      },
    });
  }

  async update(data: Partial<Prisma.ScheduleCreateInput>) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.schedule.update({ data, where: { id: schedule.id } });
  }

  async delete() {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    await db.schedule.delete({ where: { id: schedule.id } });
  }

  async addSession(data: ScheduleSessionCreateData) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    return db.scheduleSession.create({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
        color: 'gray',
        scheduleId: schedule.id,
      },
    });
  }

  async updateSession(data: ScheduleSessionUpdateData) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    let language = data.language ?? null;
    if (!language && data.proposalId) {
      const proposal = await db.proposal.findUnique({ where: { id: data.proposalId } });
      language = (proposal?.languages as Languages).at(0) ?? null;
    }

    return db.scheduleSession.update({
      data: {
        trackId: data.trackId,
        start: data.start,
        end: data.end,
        color: data.color,
        name: !data.proposalId ? (data.name ?? null) : null,
        proposalId: data.proposalId ? data.proposalId : null,
        emojis: data.emojis,
        language,
      },
      where: { id: data.id, scheduleId: schedule.id },
    });
  }

  async deleteSession(sessionId: string) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    if (!sessionId) return; // sessionId checked and deleteMany to avoid "Record to delete does not exist"
    await db.scheduleSession.deleteMany({ where: { id: sessionId, scheduleId: schedule.id } });
  }

  async saveTracks(tracks: ScheduleTracksSaveData['tracks']) {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id }, include: { tracks: true } });
    if (!schedule) throw new NotFoundError('Schedule not found');

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
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({
      where: { eventId: event.id },
      include: { tracks: true, sessions: true },
    });
    if (!schedule) return null;

    const sessions = await db.scheduleSession.findMany({
      where: { scheduleId: schedule.id },
      include: { proposal: { include: { speakers: true, formats: true, categories: true } } },
    });

    const { userId, teamSlug, eventSlug } = this.userEvent;
    const openAiConfig = await EventIntegrations.for(userId, teamSlug, eventSlug).getConfiguration('OPEN_AI');

    return {
      name: schedule.name,
      start: schedule.start,
      end: schedule.end,
      timezone: schedule.timezone,
      displayStartMinutes: schedule.displayStartMinutes,
      displayEndMinutes: schedule.displayEndMinutes,
      tracks: [...schedule.tracks]
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
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
              title: proposal.title,
              deliberationStatus: proposal.deliberationStatus,
              confirmationStatus: proposal.confirmationStatus,
              formats: proposal.formats.map((f) => ({ id: f.id, name: f.name })),
              categories: proposal.categories.map((c) => ({ id: c.id, name: c.name })),
              speakers: proposal.speakers.map((s) => ({
                id: s.id,
                name: s.name,
                picture: s.picture,
                company: s.company,
              })),
            }
          : null,
      })),
      aiEnabled: Boolean(openAiConfig),
    };
  }

  async forJsonExport() {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');

    return EventSchedule.toJson(event.id, event.type);
  }

  static async forJsonApi(eventSlug: string, apiKey: string) {
    const event = await db.event.findFirst({ where: { slug: eventSlug } });

    if (!event) throw new EventNotFoundError();
    if (event.apiKey !== apiKey) throw new ApiKeyInvalidError();

    return EventSchedule.toJson(event.id, event.type);
  }

  static async toJson(eventId: string, eventType: EventType) {
    if (eventType === 'MEETUP') throw new ForbiddenOperationError();

    const schedule = await db.schedule.findFirst({ where: { eventId }, include: { sessions: true } });
    if (!schedule) return null;

    const sessions = await db.scheduleSession.findMany({
      where: { scheduleId: schedule.id },
      include: { proposal: { include: { speakers: true, formats: true, categories: true } }, track: true },
    });

    const days = getDatesRange(schedule.start, schedule.end);

    return {
      name: schedule.name,
      days: days.map((day) => utcToTimezone(day, schedule.timezone).toISOString()),
      timeZone: schedule.timezone,
      sessions: sessions.map(({ proposal, track, ...session }) => ({
        id: session.id,
        start: utcToTimezone(session.start, schedule.timezone).toISOString(),
        end: utcToTimezone(session.end, schedule.timezone).toISOString(),
        track: track.name,
        title: proposal ? proposal.title : session.name,
        language: session.language || null,
        proposal: proposal
          ? {
              id: proposal.id,
              abstract: proposal.abstract,
              level: proposal.level || null,
              formats: proposal.formats.map(({ name }) => name),
              categories: proposal.categories.map(({ name }) => name),
              speakers: proposal.speakers.map((speaker) => ({
                id: speaker.id,
                name: speaker.name,
                bio: speaker.bio || null,
                company: speaker.company || null,
                picture: speaker.picture || null,
                socialLinks: speaker.socialLinks,
              })),
            }
          : null,
      })),
    };
  }

  // todo(tests)
  async generateWithIA({ instructions }: ScheduleIAGenerateData, locale = 'en') {
    const event = await this.userEvent.needsPermission('canEditEventSchedule');
    if (event.type === 'MEETUP') throw new ForbiddenOperationError();

    const { userId, teamSlug, eventSlug } = this.userEvent;
    const openAiConfig = await EventIntegrations.for(userId, teamSlug, eventSlug).getConfiguration('OPEN_AI');
    const aiIntegrationTeam = await flags.get('aiIntegration');

    if (!openAiConfig || openAiConfig.name !== 'OPEN_AI' || aiIntegrationTeam !== teamSlug) {
      throw new Error('OpenAI integration is not configured for this event.');
    }

    const schedule = await db.schedule.findFirst({ where: { eventId: event.id } });
    if (!schedule) throw new NotFoundError('Schedule not found');

    const sessions = await db.scheduleSession.findMany({
      where: { scheduleId: schedule.id, name: null },
      include: { track: true },
    });

    if (sessions.length === 0) {
      throw new Error('You must have at least one session slot defined in the schedule before generating.');
    }

    const proposals = await db.proposal.findMany({
      where: { eventId: event.id, deliberationStatus: 'ACCEPTED' },
      include: { formats: true, categories: true },
    });

    const systemPrompt = `
      You are a scheduling assistant for a Call For Proposal app.

      Your goal is to fill and setup a list of predefined timeslots with a given list of proposals respecting user instructions and rules.
      When no instructions are given, you must fill the timeslots with the proposals in a way that maximizes the number of proposals scheduled.

      Inputs
      - Each timeslot has attributes: id, start (date), end (date), duration, track, color, proposalId (optional)
      - Each timeslot is associated with a track.
      - Each proposal has attributes: id, title, formats, categories, languages (array of Language).

      Rules:
      - Timeslots can be defined on different days and times.
      - You cannot change the start and end times of timeslots.
      - Each timeslot can have only one proposal scheduled.
      - Each proposal can be scheduled in only one timeslot.
      - If there are more proposals than timeslots, some proposals will not be scheduled.
      - If there are more timeslots than proposals, some timeslots will not be filled.
      - Don't remove existing proposals from timeslots unless explicitly asked or if needed.
      - proposals can be scheduled in any timeslot, regardless of the track.
      - Timeslot can already be filled with a proposal (proposalId), or empty (null).
      - When a proposal is moved from a timeslot to another, the new proposal timeslot change its language and color with the previous one.
      - When a proposal is scheduled and has at least one language, it must be set to the timeslot (if multiple languages take the first one).
      - All possible timeslot colors are: ${SESSION_COLORS.map((c) => c.value).join(', ')}
      - The default timeslot color is 'stone'.
      - Always follow user instructions strictly. If a conflict arises, explain clearly and propose alternatives in additionalInfo.
      - Other names for proposal given by the user can be talk, session, presentation.
      - The user and you can never create new timeslots or proposals. (explain it in the response if needed).

      Output:
      - schedule: 
        - A schedule associating each proposal id to a timeslot id, the color and the language of the timeslot.
        - All timeslots must be returned, even if they are not filled.
      - response: 
        - Gives a explanation of the operation
        - Don't include explanations about the timeslot colors or languages.
        - Don't include explanations about the timeslots which has not been changed.
        - When explaining a proposal operation, always include the proposal title (in bold) and the timeslot.
        - Never display proposal or timeslot id in it
        - Response must be in ${locale} language
        - Formatted with markdown for better readability
    `;

    const humanPrompt = `
      Timeslots:
      ${JSON.stringify(
        sessions.map((s) => ({
          id: s.id,
          start: utcToTimezone(s.start, schedule.timezone).toISOString(),
          end: utcToTimezone(s.end, schedule.timezone).toISOString(),
          duration: formatTimeDifference(s.start, s.end),
          proposalId: s.proposalId || null,
          track: s.track.name,
          color: s.color,
        })),
      )}

      Proposals:
      ${JSON.stringify(
        proposals.map((t) => ({
          id: t.id,
          title: t.title,
          formats: t.formats.map((f) => f.name),
          categories: t.categories.map((c) => c.name),
          languages: t.languages as Language[],
        })),
      )}

      User Instructions (optional):
      ${xss(instructions ?? '')}
    `;

    console.log(humanPrompt);

    const openai = new OpenAI({ apiKey: openAiConfig.configuration.apiKey });

    try {
      const response = await openai.responses.parse({
        model: 'gpt-4.1-mini',
        temperature: 0,
        input: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: humanPrompt },
        ],
        text: { format: zodTextFormat(ScheduleGenerationResultSchema, 'schedule') },
      });

      const result = response.output_parsed;

      if (!result || result.schedule.length === 0) {
        return result?.response || 'Nothing changed.';
      }

      for (const session of sessions) {
        const sheduledSession = result.schedule.find((s) => s.timeslotId === session.id);

        await db.scheduleSession.update({
          where: { id: session.id, scheduleId: schedule.id },
          data: {
            name: null,
            proposalId: sheduledSession?.proposalId || null,
            language: sheduledSession?.language || null,
            color: sheduledSession?.color || 'stone',
          },
        });
      }

      return result.response;
    } catch (error) {
      if (error instanceof OpenAI.OpenAIError) {
        throw new Error(`OpenAI API error: ${error.message}`);
      }
      throw new Error('An unexpected error occurred while generating the schedule with AI.');
    }
  }
}
