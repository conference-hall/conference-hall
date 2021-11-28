import { PrismaClient, EventVisibility, EventType } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const boby = await prisma.user.create({ data: { name: 'boby' } });

  await Promise.all(
    getEvents().map((event) => {
      return prisma.event.create({ data: { creatorId: boby.id, ...event } });
    })
  );
}

seed();

function getEvents() {
  return [
    {
      name: 'Devfest Nantes',
      description: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
      type: EventType.CONFERENCE,
      visibility: EventVisibility.PUBLIC,
      cfpStart: new Date('2020-09-01T00:00:00.000Z'),
      cfpEnd: new Date('2022-09-01T00:00:00.000Z'),
    },
    {
      name: 'Devoxx France',
      description: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
      type: EventType.CONFERENCE,
      visibility: EventVisibility.PUBLIC,
      cfpStart: new Date('2020-09-01T00:00:00.000Z'),
      cfpEnd: new Date('2021-09-01T00:00:00.000Z'),
    },
    {
      name: 'GDG Nantes',
      description: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
      type: EventType.MEETUP,
      visibility: EventVisibility.PUBLIC,
      cfpStart: new Date('2020-09-01T00:00:00.000Z'),
      cfpEnd: null,
    },
    {
      name: 'VIP event',
      description: `I never wanted to believe that my Dad was stealing from his job as a road worker. But when I got home, all the signs were there.`,
      type: EventType.CONFERENCE,
      visibility: EventVisibility.PRIVATE,
      cfpStart: new Date('2020-09-01T00:00:00.000Z'),
      cfpEnd: new Date('2022-09-01T00:00:00.000Z'),
    },
  ];
}
