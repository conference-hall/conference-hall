import { db } from 'prisma/db.server.ts';
import { ProposalNotFoundError } from '~/shared/errors.server.ts';
import type {
  ConversationMessageDeleteData,
  ConversationMessageReactData,
  ConversationMessageSaveData,
} from './conversation.schema.server.ts';
import { ConversationService } from './conversation-service.server.ts';

export class ProposalConversationForSpeakers {
  private userId: string;
  private proposalId: string;
  private conversation: ConversationService;

  constructor(userId: string, proposalId: string) {
    this.userId = userId;
    this.proposalId = proposalId;
    this.conversation = new ConversationService({
      userId,
      role: 'SPEAKER',
      contextType: 'PROPOSAL_CONVERSATION',
      contextIds: [proposalId],
    });
  }

  static for(userId: string, proposalId: string) {
    return new ProposalConversationForSpeakers(userId, proposalId);
  }

  async saveMessage(data: ConversationMessageSaveData) {
    const proposal = await this.checkProposal();
    return this.conversation.saveMessage(proposal.eventId, data);
  }

  async reactMessage(data: ConversationMessageReactData) {
    await this.checkProposal();
    return this.conversation.reactMessage(data);
  }

  async deleteMessage(data: ConversationMessageDeleteData) {
    await this.checkProposal();
    return this.conversation.deleteMessage(data);
  }

  async getConversation() {
    const proposal = await this.checkProposal();
    return this.conversation.getConversation(proposal.eventId);
  }

  private async checkProposal() {
    const proposal = await db.proposal.findUnique({
      where: { id: this.proposalId, speakers: { some: { userId: this.userId } } },
    });
    if (!proposal) throw new ProposalNotFoundError();
    return proposal;
  }
}
