import { config } from '../app/libs/config.ts';
import { db } from '../app/libs/db.ts';

export async function disconnectDB() {
  await db.$disconnect();
  return 'db disconnected';
}

export async function resetDB() {
  if (config.isProduction && !config.useEmulators) return '🚨 Reset DB cannot be executed in production.';

  await db.$transaction([
    db.survey.deleteMany(),
    db.message.deleteMany(),
    db.review.deleteMany(),
    db.resultPublication.deleteMany(),
    db.proposal.deleteMany(),
    db.talk.deleteMany(),
    db.eventFormat.deleteMany(),
    db.eventCategory.deleteMany(),
    db.event.deleteMany(),
    db.teamMember.deleteMany(),
    db.team.deleteMany(),
    db.organizerKeyAccess.deleteMany(),
    db.user.deleteMany(),
  ]);

  await disconnectDB();

  return 'db reset done';
}
