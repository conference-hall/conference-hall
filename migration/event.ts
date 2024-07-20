import { Prisma, TeamRole } from '@prisma/client';
import slugify, { slugifyWithCounter } from '@sindresorhus/slugify';
import { endOfDay, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server.ts';
import ProgressBar from 'progress';

import {
  checkEmail,
  checkUrl,
  findUser,
  mapBoolean,
  mapEmailNotifications,
  mapEventType,
  mapEventVisibility,
  mapInteger,
  mapSurveyQuestions,
} from './utils.ts';

// Memoize
const memoizedUsers = new Map<string, string>();

const slugifyEvent = slugifyWithCounter();

const eventsWithoutTeam = [];
const eventsWithoutOwner = [];

/**
 * Migrate Events with categories and formats
 */
export async function migrateEvents(firestore: admin.firestore.Firestore) {
  const events = (await firestore.collection('events').get()).docs;
  const eventProgress = new ProgressBar('  Events     [:percent] - Elapsed: :elapseds - ETA: :etas (:rate/s) [:bar]', {
    total: events.length,
  });

  for (const eventDoc of events) {
    const data = eventDoc.data();
    eventProgress.tick();

    let creatorId = await findUser(data.owner, memoizedUsers);

    let team = null;
    if (data.organization) {
      team = await db.team.findFirst({
        where: { migrationId: data.organization },
        include: { members: { where: { role: TeamRole.OWNER } } },
      });

      if (!creatorId) {
        creatorId = team?.members?.at(0)?.memberId;
      }
    } else if (creatorId) {
      const creator = await db.user.findFirst({ where: { id: creatorId } });
      const slug = slugify(`team-${creatorId}`);
      team = await db.team.findFirst({ where: { slug } });
      if (!team) {
        team = await db.team.create({
          data: {
            slug,
            name: `${creator?.name}'s team`,
            members: { create: [{ role: 'OWNER', member: { connect: { id: creatorId } } }] },
          },
        });
      }
    }

    const settings = (
      await firestore.collection('events').doc(eventDoc.id).collection('settings').limit(1).get()
    ).docs?.[0]?.data();

    const timezone = data?.address?.timezone?.id || 'Europe/Paris';

    const event: Prisma.EventCreateInput = {
      migrationId: eventDoc.id,
      name: data.name,
      slug: slugifyEvent(data.name),
      type: mapEventType(data.type),
      visibility: mapEventVisibility(data.visibility),
      timezone,
      logoUrl: checkUrl(data.bannerUrl),
      description: data.description,
      contactEmail: checkEmail(data.contact),
      websiteUrl: checkUrl(data.website),
      cfpStart: cfpDates('start', data, timezone),
      cfpEnd: cfpDates('end', data, timezone),
      conferenceStart: conferenceDates('start', data, timezone),
      conferenceEnd: conferenceDates('end', data, timezone),
      location: data.address?.formattedAddress,
      lat: data.address?.latLng?.lat,
      lng: data.address?.latLng?.lng,
      displayProposalsReviews:
        settings?.deliberation?.displayRatings === undefined
          ? undefined
          : mapBoolean(settings?.deliberation?.displayRatings),
      displayProposalsSpeakers:
        settings?.deliberation?.blindRating === undefined
          ? undefined
          : !mapBoolean(settings?.deliberation?.blindRating),
      surveyEnabled: mapBoolean(data.surveyActive),
      surveyQuestions: mapSurveyQuestions(data.survey),
      emailOrganizer: settings?.notifications?.recipients?.contact ? data.contact : undefined,
      emailNotifications: mapEmailNotifications(settings?.notifications?.emails),
      slackWebhookUrl: checkUrl(settings?.slack?.webhookUrl),
      apiKey: settings?.api?.apiKey,
      categories: { create: mapCategories(data.categories) },
      categoriesRequired: mapBoolean(data?.mandatoryFields?.categories),
      formats: { create: mapFormats(data.formats) },
      formatsRequired: mapBoolean(data?.mandatoryFields?.formats),
      maxProposals: mapInteger(data.maxProposals),
      archived: mapBoolean(data.archived),
      team: { connect: { id: team?.id } },
      creator: { connect: { id: creatorId } },
      createdAt: data.createTimestamp?.toDate(),
      updatedAt: data.updateTimestamp?.toDate(),
    };

    if (!team) {
      eventsWithoutTeam.push(event.migrationId);
      continue;
    } else if (!creatorId) {
      console.log(JSON.stringify(data));
      eventsWithoutOwner.push(event.migrationId);
      continue;
    }

    await createEvent(event);
  }

  console.log(` > Events without team: ${eventsWithoutTeam.length}`);
  console.log(` > Events without owner: ${eventsWithoutOwner.length}`);
  console.log(
    ` > Events migrated ${events.length - eventsWithoutTeam.length - eventsWithoutOwner.length} / ${events.length}`,
  );
}

async function createEvent(event: Prisma.EventCreateInput) {
  try {
    await db.event.create({ data: event });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      event.slug = slugifyEvent(event.name);
      await createEvent(event);
    } else {
      console.log(error);
      console.log(event.migrationId, event.name, event.slug);
      throw error;
    }
  }
}

function conferenceDates(date: 'start' | 'end', data: any, timezone: string): Date | undefined {
  if (data.type === 'conference') {
    if (!data?.conferenceDates?.[date]) return undefined;

    const currentTz = toZonedTime(data?.conferenceDates?.[date]?.toDate(), timezone);
    if (!(currentTz instanceof Date)) return undefined;

    if (date === 'start') {
      return fromZonedTime(startOfDay(currentTz), timezone);
    } else {
      return fromZonedTime(endOfDay(currentTz), timezone);
    }
  }
  return undefined;
}

function cfpDates(date: 'start' | 'end', data: any, timezone: string): Date | undefined {
  if (data.type === 'conference') {
    if (!data?.cfpDates?.[date]) return undefined;

    const currentTz = toZonedTime(data?.cfpDates?.[date]?.toDate(), timezone);
    if (!(currentTz instanceof Date)) return undefined;

    if (date === 'start') {
      return fromZonedTime(startOfDay(currentTz), timezone);
    } else {
      return fromZonedTime(endOfDay(currentTz), timezone);
    }
  }
  const cfpOpened = mapBoolean(data?.cfpOpened);
  if (data.type === 'meetup' && date === 'start' && cfpOpened) {
    return fromZonedTime(startOfDay(toZonedTime(new Date(), timezone)), timezone);
  }
  return undefined;
}

function mapCategories(categories?: Array<{ id: string; name: string; description?: string }> | null) {
  if (!categories) return undefined;

  const connects = [];
  for (const category of categories) {
    connects.push({ name: category.name, description: category.description, migrationId: category.id });
  }

  return connects;
}

function mapFormats(formats?: Array<{ id: string; name: string; description?: string }> | null) {
  if (!formats) return undefined;

  const connects = [];
  for (const format of formats) {
    connects.push({ name: format.name, description: format.description, migrationId: format.id });
  }

  return connects;
}
