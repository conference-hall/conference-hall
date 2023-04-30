import { config } from '../app/libs/config';
import { db } from '../app/libs/db';

export async function disconnectDB() {
  await db.$disconnect();
  return 'db disconnected';
}

export async function resetDB() {
  if (config.isProduction && !config.useEmulators) return '🚨 Reset DB cannot be executed in production.';

  await db.$transaction([
    db.survey.deleteMany(),
    db.message.deleteMany(),
    db.rating.deleteMany(),
    db.proposal.deleteMany(),
    db.talk.deleteMany(),
    db.eventFormat.deleteMany(),
    db.eventCategory.deleteMany(),
    db.event.deleteMany(),
    db.organizationMember.deleteMany(),
    db.organization.deleteMany(),
    db.organizerKeyAccess.deleteMany(),
    db.user.deleteMany(),
  ]);

  await disconnectDB();

  return 'db reset done';
}
