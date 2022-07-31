import type { Prisma, Proposal, Talk } from '@prisma/client';
import { db } from '../../app/services/db';
import { userFactory } from './users';

type FactoryOptions = {
  proposal?: Proposal;
  talk?: Talk;
  attributes?: Prisma.InviteCreateInput;
};

export const inviteFactory = async (options: FactoryOptions) => {
  const { attributes, proposal, talk } = options;

  if (proposal) {
    const inviteBy = await userFactory();
    const defaultAttributes: Prisma.InviteCreateInput = {
      type: 'PROPOSAL',
      proposal: { connect: { id: proposal.id } },
      invitedBy: { connect: { id: inviteBy.id } },
    };
    return db.invite.create({ data: { ...defaultAttributes, ...attributes } });
  }

  if (talk) {
    const inviteBy = await userFactory();
    const defaultAttributes: Prisma.InviteCreateInput = {
      type: 'TALK',
      talk: { connect: { id: talk.id } },
      invitedBy: { connect: { id: inviteBy.id } },
    };
    return db.invite.create({ data: { ...defaultAttributes, ...attributes } });
  }
};
