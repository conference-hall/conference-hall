import { config } from '../app/services/config'
import { db } from '../app/services/db'

export async function disconnectDB() {
  await db.$disconnect()
  return 'db disconnected'
}

export async function resetDB() {
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
  return 'db reset'
}
