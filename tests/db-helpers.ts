import { db } from '../prisma/db.server.ts';

export async function disconnectDB() {
  await db.$disconnect();
  return 'db disconnected';
}

export async function resetDB() {
  if (process.env.NODE_ENV === 'production' && !process.env.USE_EMULATORS) {
    return '🚨 Reset DB cannot be executed in production.';
  }

  await db.$transaction([
    db.survey.deleteMany(),
    db.comment.deleteMany(),
    db.review.deleteMany(),
    db.scheduleSession.deleteMany(),
    db.scheduleTrack.deleteMany(),
    db.schedule.deleteMany(),
    db.proposal.deleteMany(),
    db.talk.deleteMany(),
    db.eventFormat.deleteMany(),
    db.eventCategory.deleteMany(),
    db.eventIntegrationConfig.deleteMany(),
    db.event.deleteMany(),
    db.teamMember.deleteMany(),
    db.team.deleteMany(),
    db.organizerKeyAccess.deleteMany(),
    db.user.deleteMany(),
  ]);

  await disconnectDB();

  return 'db reset done';
}
