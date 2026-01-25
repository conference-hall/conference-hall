import { db } from '../prisma/db.server.ts';
import { getSharedServerEnv } from '../servers/environment.server.ts';

const { NODE_ENV } = getSharedServerEnv();

export async function disconnectDB() {
  await db.$disconnect();
  return 'db disconnected';
}

export async function resetDB() {
  if (NODE_ENV === 'production') {
    return '🚨 Reset DB cannot be executed in production.';
  }

  await db.$transaction([
    db.survey.deleteMany(),
    db.commentReaction.deleteMany(),
    db.comment.deleteMany(),
    db.review.deleteMany(),
    db.conversationReaction.deleteMany(),
    db.conversationParticipant.deleteMany(),
    db.conversationMessage.deleteMany(),
    db.conversation.deleteMany(),
    db.scheduleSession.deleteMany(),
    db.scheduleTrack.deleteMany(),
    db.schedule.deleteMany(),
    db.proposal.deleteMany(),
    db.talk.deleteMany(),
    db.eventFormat.deleteMany(),
    db.eventCategory.deleteMany(),
    db.eventProposalTag.deleteMany(),
    db.eventIntegrationConfig.deleteMany(),
    db.eventEmailCustomization.deleteMany(),
    db.eventSpeaker.deleteMany(),
    db.event.deleteMany(),
    db.teamMember.deleteMany(),
    db.team.deleteMany(),
    db.organizerKeyAccess.deleteMany(),
    db.user.deleteMany(),
  ]);

  return 'db reset done';
}
