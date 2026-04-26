import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';
import { db } from '../../../../prisma/db.server.ts';
import { ConversationService } from './conversation-service.server.ts';
import type {
  ConversationMessageDeleteData,
  ConversationMessageReactData,
  ConversationMessageSaveData,
} from './conversation.schema.server.ts';

export class ProposalReviewComments {
  private conversation: ConversationService;
  private authorizedEvent: AuthorizedEvent;
  private proposalId: string;

  constructor(authorizedEvent: AuthorizedEvent, proposalId: string) {
    this.proposalId = proposalId;
    this.authorizedEvent = authorizedEvent;
    this.conversation = new ConversationService({
      userId: authorizedEvent.userId,
      role: 'ORGANIZER',
      contextType: 'PROPOSAL_REVIEW_COMMENTS',
      proposalId,
      skipNotification: true,
    });
  }

  static for(authorizedEvent: AuthorizedEvent, proposalId: string) {
    return new ProposalReviewComments(authorizedEvent, proposalId);
  }

  async saveMessage(data: ConversationMessageSaveData) {
    const { event, permissions } = this.authorizedEvent;
    await this.checkProposal();
    return this.conversation.saveMessage(event.id, data, permissions?.canManageConversations);
  }

  async reactMessage(data: ConversationMessageReactData) {
    return this.conversation.reactMessage(data);
  }

  async deleteMessage(data: ConversationMessageDeleteData) {
    const { permissions } = this.authorizedEvent;
    return this.conversation.deleteMessage(data, permissions?.canManageConversations);
  }

  async getConversation() {
    const { event } = this.authorizedEvent;
    await this.checkProposal();
    return this.conversation.getConversation(event.id);
  }

  private async checkProposal() {
    const { event } = this.authorizedEvent;
    const proposal = await db.proposal.findUnique({ where: { id: this.proposalId, eventId: event.id } });
    if (!proposal) throw new ProposalNotFoundError();
  }
}
