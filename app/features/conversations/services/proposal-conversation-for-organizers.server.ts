import { db } from 'prisma/db.server.ts';
import { ForbiddenOperationError, ProposalNotFoundError } from '~/shared/errors.server.ts';
import { UserEventAuthorization } from '~/shared/user/user-event-authorization.server.ts';
import type {
  ConversationMessageDeleteData,
  ConversationMessageReactData,
  ConversationMessageSaveData,
} from './conversation.schema.server.ts';
import { ConversationService } from './conversation-service.server.ts';

export class ProposalConversationForOrganizers {
  private conversation: ConversationService;
  private authorizations: UserEventAuthorization;
  private proposalId: string;

  constructor(userId: string, team: string, event: string, proposalId: string) {
    this.proposalId = proposalId;
    this.authorizations = new UserEventAuthorization(userId, team, event);
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
    // todo(conversion): improve double query on authorizations
    const event = await this.authorizations.needsPermission('canAccessEvent');
    const permissions = await this.authorizations.getPermissions();
    return this.conversation.saveMessage(event.id, data, permissions?.canManageConversations);
  }

  async reactMessage(data: ConversationMessageReactData) {
    await this.authorizations.needsPermission('canAccessEvent');
    return this.conversation.reactMessage(data);
  }

  async deleteMessage(data: ConversationMessageDeleteData) {
    // todo(conversion): improve double query on authorizations
    const permissions = await this.authorizations.getPermissions();
    if (!permissions.canAccessEvent) throw new ForbiddenOperationError();
    return this.conversation.deleteMessage(data, permissions?.canManageConversations);
  }

  async getConversation() {
    const event = await this.authorizations.needsPermission('canAccessEvent');
    const proposal = await db.proposal.findUnique({ where: { id: this.proposalId, eventId: event.id } });
    if (!proposal) throw new ProposalNotFoundError();

    return this.conversation.getConversation(event.id);
  }
}
