import * as fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function resetDB() {
  await prisma.betaKey.deleteMany();
  await prisma.invite.deleteMany();
  await prisma.survey.deleteMany();
  await prisma.message.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.proposal.deleteMany();
  await prisma.talk.deleteMany();
  await prisma.eventFormat.deleteMany();
  await prisma.eventCategory.deleteMany();
  await prisma.event.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.user.deleteMany();
}

export async function seed(filename) {
  const content = fs.readFileSync(filename, 'utf8');
  const datasets = JSON.parse(content);

  for (const dataset of datasets) {
    const { type, data } = dataset;
    const obj = prisma[type];
    if (!obj) {
      throw new Error(`Type "${type}" does not exist in your prisma schema.`);
    }
    await obj.createMany({ data });
  }
}
