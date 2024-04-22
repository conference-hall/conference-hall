import { Prisma } from '@prisma/client';
import { slugifyWithCounter } from '@sindresorhus/slugify';
import type admin from 'firebase-admin';
import { db } from 'prisma/db.server';
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
} from './utils';

// Memoize
const memoizedUsers = new Map<string, string>();

const slugify = slugifyWithCounter();

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

    const creatorId = await findUser(data.owner, memoizedUsers);

    let team = null;
    if (data.organization) {
      team = await db.team.findFirst({ where: { migrationId: data.organization } });
    } else if (creatorId) {
      const creator = await db.user.findFirst({ where: { id: creatorId } });
      team = await db.team.create({
        data: {
          slug: slugify(`team-${creator?.name}`),
          name: `Team ${creator?.name}`,
          members: { create: [{ role: 'OWNER', member: { connect: { id: creatorId } } }] },
        },
      });
    }

    const settings = (
      await firestore.collection('events').doc(eventDoc.id).collection('settings').limit(1).get()
    ).docs?.[0]?.data();

    const event: Prisma.EventCreateInput = {
      migrationId: eventDoc.id,
      name: data.name,
      slug: slugify(data.name),
      type: mapEventType(data.type),
      visibility: mapEventVisibility(data.visibility),
      logo: checkUrl(data.bannerUrl), // TODO: rename to logoUrl?
      description: data.description,
      contactEmail: checkEmail(data.contact),
      websiteUrl: checkUrl(data.website),
      cfpStart: cfpDates('start', data),
      cfpEnd: cfpDates('end', data),
      conferenceStart: data?.conferenceDates?.start?.toDate(),
      conferenceEnd: data?.conferenceDates?.end?.toDate(),
      address: data.address?.formattedAddress,
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
      eventsWithoutOwner.push(event.migrationId);
      continue;
    }

    await createEvent(event);
  }

  console.log(` > Events without team: ${eventsWithoutTeam.length}`);
  console.log(` > Events without owner: ${eventsWithoutOwner.length}`);
  console.log(` > Events migrated ${events.length - eventsWithoutTeam.length - eventsWithoutOwner.length}`);
}

async function createEvent(event: Prisma.EventCreateInput) {
  try {
    await db.event.create({ data: event });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      event.slug = slugify(event.name);
      await createEvent(event);
    } else {
      throw e;
    }
  }
}

function cfpDates(date: 'start' | 'end', data: any) {
  if (data.type === 'conference') {
    return data?.cfpDates?.[date]?.toDate();
  }
  const cfpOpened = mapBoolean(data?.cfpOpened);
  if (data.type === 'meetup' && date === 'start' && cfpOpened) {
    return new Date();
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
