import * as fs from 'fs';

import { config } from '../app/server/config'
import { db } from '../app/server/db'

export async function disconnect() {
  await db.$disconnect()
}

export async function resetTestDatabase() {
  if (config.isTest) {
    await db.betaKey.deleteMany()
    await db.invite.deleteMany()
    await db.survey.deleteMany()
    await db.message.deleteMany()
    await db.rating.deleteMany()
    await db.proposal.deleteMany()
    await db.talk.deleteMany()
    await db.eventFormat.deleteMany()
    await db.eventCategory.deleteMany()
    await db.event.deleteMany()
    await db.organizationMember.deleteMany()
    await db.organization.deleteMany()
    await db.user.deleteMany()
  }
}

export async function seedFromFile(filename: string) {
  const content = fs.readFileSync(filename, 'utf8');
  const datasets = JSON.parse(content);

  for (const dataset of datasets) {
    const { type, data } = dataset;
    // @ts-ignore
    const obj = db[type];
    if (!obj) {
      throw new Error(`Type "${type}" does not exist in your prisma schema.`);
    }
    await obj.createMany({ data });
  }
}

export function setupDatabase() {
  beforeEach(resetTestDatabase)
  afterAll(disconnect)
}
