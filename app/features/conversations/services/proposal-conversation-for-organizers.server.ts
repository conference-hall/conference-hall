import type { AuthorizedEvent } from '~/shared/authorization/types.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';
import type {
  ConversationMessageDeleteData,
  ConversationMessageReactData,
  ConversationMessageSaveData,
} from './conversation.schema.server.ts';
import { db } from '../../../../prisma/db.server.ts';
import { ConversationService } from './conversation-service.server.ts';

export class ProposalConversationForOrganizers {
  private conversation: ConversationService;
  private authorizedEvent: AuthorizedEvent;
  private proposalId: string;

  constructor(authorizedEvent: AuthorizedEvent, proposalId: string) {
    this.proposalId = proposalId;
    this.authorizedEvent = authorizedEvent;
    this.conversation = new ConversationService({
      userId: authorizedEvent.userId,
      role: 'ORGANIZER',
      contextType: 'PROPOSAL_CONVERSATION',
      contextIds: [proposalId],
    });
  }

  static for(authorizedEvent: AuthorizedEvent, proposalId: string) {
    return new ProposalConversationForOrganizers(authorizedEvent, proposalId);
  }

  async saveMessage(data: ConversationMessageSaveData) {
    const { event, permissions } = this.authorizedEvent;
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

    const proposal = await db.proposal.findUnique({ where: { id: this.proposalId, eventId: event.id } });
    if (!proposal) throw new ProposalNotFoundError();

    return this.conversation.getConversation(event.id);
  }
}
