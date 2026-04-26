import { logger } from '../../app/shared/logger/logger.server.ts';
import { db } from '../db.server.ts';

const DRY_RUN = process.argv.includes('--dry-run');
const BATCH_SIZE = 500;

type CommentRow = {
  id: string;
  userId: string;
  proposalId: string;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
};

type ReactionRow = {
  id: string;
  code: string;
  commentId: string;
  userId: string;
};

type ProposalEvent = {
  proposalId: string;
  eventId: string;
};

async function migrate() {
  logger.info(`Migration started${DRY_RUN ? ' (DRY RUN)' : ''}`);

  // 1. Get all distinct proposalIds with their eventId from ORGANIZER comments
  const proposalEvents = await db.$queryRaw<ProposalEvent[]>`
    SELECT DISTINCT c."proposalId", p."eventId"
    FROM comments c
    INNER JOIN proposals p ON p.id = c."proposalId"
    WHERE c.channel = 'ORGANIZER'
  `;

  logger.info(`Found ${proposalEvents.length} proposals with organizer comments`);

  // 2. Fetch all organizer comments ordered by creation date
  const comments = await db.$queryRaw<CommentRow[]>`
    SELECT id, "userId", "proposalId", comment, "createdAt", "updatedAt"
    FROM comments
    WHERE channel = 'ORGANIZER'
    ORDER BY "createdAt" ASC
  `;

  logger.info(`Found ${comments.length} organizer comments to migrate`);

  // 3. Fetch all reactions for organizer comments
  const reactions = await db.$queryRaw<ReactionRow[]>`
    SELECT cr.id, cr.code, cr."commentId", cr."userId"
    FROM comment_reactions cr
    INNER JOIN comments c ON c.id = cr."commentId"
    WHERE c.channel = 'ORGANIZER'
  `;

  logger.info(`Found ${reactions.length} reactions to migrate`);

  if (DRY_RUN) {
    logger.info('Dry run complete, no changes made');
    await db.$disconnect();
    return;
  }

  // 4. Create conversations, messages, participants, and reactions
  const commentIdToMessageId = new Map<string, string>();
  let conversationsCreated = 0;
  let messagesCreated = 0;
  let participantsCreated = 0;
  let reactionsCreated = 0;

  // Group comments by proposalId
  const commentsByProposal = new Map<string, CommentRow[]>();
  for (const comment of comments) {
    const existing = commentsByProposal.get(comment.proposalId) ?? [];
    existing.push(comment);
    commentsByProposal.set(comment.proposalId, existing);
  }

  // Group reactions by commentId
  const reactionsByComment = new Map<string, ReactionRow[]>();
  for (const reaction of reactions) {
    const existing = reactionsByComment.get(reaction.commentId) ?? [];
    existing.push(reaction);
    reactionsByComment.set(reaction.commentId, existing);
  }

  // Process each proposal in batches
  for (let i = 0; i < proposalEvents.length; i += BATCH_SIZE) {
    const batch = proposalEvents.slice(i, i + BATCH_SIZE);

    await db.$transaction(async (tx) => {
      for (const { proposalId, eventId } of batch) {
        const proposalComments = commentsByProposal.get(proposalId) ?? [];
        if (proposalComments.length === 0) continue;

        // Check if conversation already exists (idempotency)
        const existing = await tx.conversation.findFirst({
          where: { proposalId, contextType: 'PROPOSAL_REVIEW_COMMENTS' },
        });
        if (existing) {
          logger.info(`Skipping proposal ${proposalId}, conversation already exists`);
          continue;
        }

        // Create conversation
        const conversation = await tx.conversation.create({
          data: {
            eventId,
            proposalId,
            contextType: 'PROPOSAL_REVIEW_COMMENTS',
          },
        });
        conversationsCreated++;

        // Create messages
        const senderIds = new Set<string>();
        for (const comment of proposalComments) {
          const message = await tx.conversationMessage.create({
            data: {
              conversationId: conversation.id,
              senderId: comment.userId,
              content: comment.comment,
              type: 'TEXT',
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
            },
          });
          commentIdToMessageId.set(comment.id, message.id);
          messagesCreated++;
          senderIds.add(comment.userId);
        }

        // Create participants
        for (const senderId of senderIds) {
          await tx.conversationParticipant.create({
            data: {
              conversationId: conversation.id,
              userId: senderId,
              role: 'ORGANIZER',
            },
          });
          participantsCreated++;
        }

        // Create reactions for this proposal's comments
        for (const comment of proposalComments) {
          const commentReactions = reactionsByComment.get(comment.id) ?? [];
          const messageId = commentIdToMessageId.get(comment.id);
          if (!messageId) continue;

          for (const reaction of commentReactions) {
            await tx.conversationReaction.create({
              data: {
                code: reaction.code,
                messageId,
                userId: reaction.userId,
              },
            });
            reactionsCreated++;
          }
        }
      }
    });

    logger.info(`Processed ${Math.min(i + BATCH_SIZE, proposalEvents.length)}/${proposalEvents.length} proposals`);
  }

  logger.info('Migration complete', {
    conversationsCreated,
    messagesCreated,
    participantsCreated,
    reactionsCreated,
  });

  // 5. Verification
  const newMessageCount = await db.conversationMessage.count({
    where: { conversation: { contextType: 'PROPOSAL_REVIEW_COMMENTS' } },
  });
  const newReactionCount = await db.conversationReaction.count({
    where: { message: { conversation: { contextType: 'PROPOSAL_REVIEW_COMMENTS' } } },
  });

  logger.info('Verification', {
    originalComments: comments.length,
    migratedMessages: newMessageCount,
    originalReactions: reactions.length,
    migratedReactions: newReactionCount,
    commentsMatch: comments.length === newMessageCount,
    reactionsMatch: reactions.length === newReactionCount,
  });

  await db.$disconnect();
}

migrate().catch((error) => {
  logger.error('Migration failed', { error });
  process.exit(1);
});
