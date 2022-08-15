import { config } from '../app/services/config';
import { db } from '../app/services/db';

export async function disconnectDB() {
  await db.$disconnect();
  return 'db disconnected';
}

export async function resetDB() {
  if (config.isProduction) return '🚨 Reset DB cannot be executed in production.';

  await db.$transaction([
    db.betaKey.deleteMany(),
    db.invite.deleteMany(),
    db.survey.deleteMany(),
    db.message.deleteMany(),
    db.proposal.deleteMany(),
    db.rating.deleteMany(),
    db.talk.deleteMany(),
    db.eventFormat.deleteMany(),
    db.eventCategory.deleteMany(),
    db.event.deleteMany(),
    db.organizationMember.deleteMany(),
    db.organization.deleteMany(),
    db.user.deleteMany(),
  ]);

  await disconnectDB();

  return 'db reset done';
}
