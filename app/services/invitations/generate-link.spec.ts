import { InviteType } from '@prisma/client';
import { organizationFactory } from 'tests/factories/organization';
import { resetDB, disconnectDB } from '../../../tests/db-helpers';
import { eventFactory } from '../../../tests/factories/events';
import { inviteFactory } from '../../../tests/factories/invite';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';
import { db } from '../db';
import { OrganizationNotFoundError, ProposalNotFoundError, TalkNotFoundError } from '../errors';
import { generateLink } from './generate-link.server';

describe('#generateLink', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  describe('for talk invitation', () => {
    it('generates an invitation for a talk', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });

      const link = await generateLink(InviteType.TALK, talk.id, speaker.id);

      const invite = await db.invite.findFirst();

      expect(invite?.talkId).toEqual(talk.id);
      expect(invite?.type).toEqual(InviteType.TALK);
      expect(invite?.userId).toEqual(speaker.id);
      expect(link).toEqual(`http://localhost:3001/invitation/${invite?.id}`);
    });

    it('returns existing invitation link for a talk', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const invite = await inviteFactory({ talk, user: speaker });

      const link = await generateLink(InviteType.TALK, talk.id, speaker.id);

      expect(invite?.talkId).toEqual(talk.id);
      expect(invite?.type).toEqual(InviteType.TALK);
      expect(invite?.userId).toEqual(speaker.id);
      expect(link).toEqual(`http://localhost:3001/invitation/${invite?.id}`);
    });

    it('throws an error when talk does not belong to user', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const user = await userFactory();
      await expect(generateLink(InviteType.TALK, talk.id, user.id)).rejects.toThrowError(TalkNotFoundError);
    });

    it('throws an error when talk is not found', async () => {
      const speaker = await userFactory();
      await expect(generateLink(InviteType.TALK, 'XXX', speaker.id)).rejects.toThrowError(TalkNotFoundError);
    });
  });

  describe('for proposal invitation', () => {
    it('generates an invitation for a proposal', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });

      const link = await generateLink(InviteType.PROPOSAL, proposal.id, speaker.id);

      const invite = await db.invite.findFirst();

      expect(invite?.proposalId).toEqual(proposal.id);
      expect(invite?.type).toEqual(InviteType.PROPOSAL);
      expect(invite?.userId).toEqual(speaker.id);
      expect(link).toEqual(`http://localhost:3001/invitation/${invite?.id}`);
    });

    it('returns existing invitation link for a proposal', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const invite = await inviteFactory({ proposal, user: speaker });

      const link = await generateLink(InviteType.PROPOSAL, proposal.id, speaker.id);

      expect(invite?.proposalId).toEqual(proposal.id);
      expect(invite?.type).toEqual(InviteType.PROPOSAL);
      expect(invite?.userId).toEqual(speaker.id);
      expect(link).toEqual(`http://localhost:3001/invitation/${invite?.id}`);
    });

    it('throws an error when talk does not belong to user', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const user = await userFactory();
      await expect(generateLink(InviteType.PROPOSAL, proposal.id, user.id)).rejects.toThrowError(ProposalNotFoundError);
    });

    it('throws an error when talk is not found', async () => {
      const speaker = await userFactory();
      await expect(generateLink(InviteType.PROPOSAL, 'XXX', speaker.id)).rejects.toThrowError(ProposalNotFoundError);
    });
  });

  describe('for organization invitation', () => {
    it('generates an invitation for an organization', async () => {
      const owner = await userFactory();
      const organization = await organizationFactory({ owners: [owner] });

      const link = await generateLink(InviteType.ORGANIZATION, organization.id, owner.id);

      const invite = await db.invite.findFirst();

      expect(invite?.organizationId).toEqual(organization.id);
      expect(invite?.type).toEqual(InviteType.ORGANIZATION);
      expect(invite?.userId).toEqual(owner.id);
      expect(link).toEqual(`http://localhost:3001/invitation/${invite?.id}`);
    });

    it('returns existing invitation link for a proposal', async () => {
      const owner = await userFactory();
      const organization = await organizationFactory({ owners: [owner] });
      const invite = await inviteFactory({ organization, user: owner });

      const link = await generateLink(InviteType.ORGANIZATION, organization.id, owner.id);

      expect(invite?.organizationId).toEqual(organization.id);
      expect(invite?.type).toEqual(InviteType.ORGANIZATION);
      expect(invite?.userId).toEqual(owner.id);
      expect(link).toEqual(`http://localhost:3001/invitation/${invite?.id}`);
    });

    it('throws an error when organization does not belong to user', async () => {
      const organization = await organizationFactory();
      const user = await userFactory();
      await expect(generateLink(InviteType.ORGANIZATION, organization.id, user.id)).rejects.toThrowError(
        OrganizationNotFoundError
      );
    });

    it('throws an error when talk is not found', async () => {
      const user = await userFactory();
      await expect(generateLink(InviteType.ORGANIZATION, 'XXX', user.id)).rejects.toThrowError(
        OrganizationNotFoundError
      );
    });
  });
});
