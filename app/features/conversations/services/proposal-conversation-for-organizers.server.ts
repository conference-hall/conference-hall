import { db } from 'prisma/db.server.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';
import { EventAuthorization } from '~/shared/user/event-authorization.server.ts';
import type {
  ConversationMessageDeleteData,
  ConversationMessageReactData,
  ConversationMessageSaveData,
} from './conversation.schema.server.ts';
import { ConversationService } from './conversation-service.server.ts';

export class ProposalConversationForOrganizers {
  private conversation: ConversationService;
  private authorizations: EventAuthorization;
  private proposalId: string;

  constructor(userId: string, team: string, event: string, proposalId: string) {
    this.proposalId = proposalId;
    this.authorizations = new EventAuthorization(userId, team, event);
    this.conversation = new ConversationService({
      userId,
      role: 'ORGANIZER',
      contextType: 'PROPOSAL_CONVERSATION',
      contextIds: [proposalId],
    });
  }

  static for(userId: string, team: string, event: string, proposalId: string) {
    return new ProposalConversationForOrganizers(userId, team, event, proposalId);
  }

  async saveMessage(data: ConversationMessageSaveData) {
    const { event, permissions } = await this.authorizations.checkAuthorizedEvent('canAccessEvent');
    return this.conversation.saveMessage(event.id, data, permissions?.canManageConversations);
  }

  async reactMessage(data: ConversationMessageReactData) {
    await this.authorizations.checkAuthorizedEvent('canAccessEvent');
    return this.conversation.reactMessage(data);
  }

  async deleteMessage(data: ConversationMessageDeleteData) {
    const { permissions } = await this.authorizations.checkAuthorizedEvent('canAccessEvent');
    return this.conversation.deleteMessage(data, permissions?.canManageConversations);
  }

  async getConversation() {
    const { event } = await this.authorizations.checkAuthorizedEvent('canAccessEvent');
    if (!event.speakersConversationEnabled) return [];

    const proposal = await db.proposal.findUnique({ where: { id: this.proposalId, eventId: event.id } });
    if (!proposal) throw new ProposalNotFoundError();

    return this.conversation.getConversation(event.id);
  }
}
