import { InviteType } from '@prisma/client';
import { disconnectDB, resetDB } from 'tests/db-helpers';
import { eventFactory } from 'tests/factories/events';
import { inviteFactory } from 'tests/factories/invite';
import { organizationFactory } from 'tests/factories/organization';
import { proposalFactory } from 'tests/factories/proposals';
import { talkFactory } from 'tests/factories/talks';
import { userFactory } from 'tests/factories/users';
import { db } from '../db';
import { revokeLink } from './revoke-link.server';

describe('#revokeLink', () => {
  beforeEach(async () => {
    await resetDB();
  });
  afterEach(disconnectDB);

  describe('for talk invitation', () => {
    it('revokes an invitation for a talk', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const invite = await inviteFactory({ talk });

      await revokeLink(InviteType.TALK, talk.id, speaker.id);

      const count = await db.invite.count({ where: { id: invite?.id } });

      expect(count).toEqual(0);
    });

    it('does nothing if invitation not created by user', async () => {
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const invite = await inviteFactory({ talk, user: speaker });

      const user = await userFactory();
      await revokeLink(InviteType.TALK, talk.id, user.id);

      const count = await db.invite.count({ where: { id: invite?.id } });

      expect(count).toEqual(1);
    });
  });

  describe('for proposal invitation', () => {
    it('revokes an invitation for a proposal', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const invite = await inviteFactory({ proposal });

      await revokeLink(InviteType.PROPOSAL, proposal.id, speaker.id);

      const count = await db.invite.count({ where: { id: invite?.id } });

      expect(count).toEqual(0);
    });

    it('does nothing if invitation not created by user', async () => {
      const event = await eventFactory();
      const speaker = await userFactory();
      const talk = await talkFactory({ speakers: [speaker] });
      const proposal = await proposalFactory({ event, talk });
      const invite = await inviteFactory({ proposal, user: speaker });

      const user = await userFactory();
      await revokeLink(InviteType.PROPOSAL, proposal.id, user.id);

      const count = await db.invite.count({ where: { id: invite?.id } });

      expect(count).toEqual(1);
    });
  });

  describe('for organization invitation', () => {
    it('revokes an invitation for a organization', async () => {
      const owner = await userFactory();
      const organization = await organizationFactory({ owners: [owner] });
      const invite = await inviteFactory({ organization, user: owner });

      await revokeLink(InviteType.ORGANIZATION, organization.id, owner.id);

      const count = await db.invite.count({ where: { id: invite?.id } });

      expect(count).toEqual(0);
    });

    it('does nothing if invitation not created by user', async () => {
      const owner = await userFactory();
      const organization = await organizationFactory({ owners: [owner] });
      const invite = await inviteFactory({ organization, user: owner });

      const user = await userFactory();
      await revokeLink(InviteType.ORGANIZATION, organization.id, user.id);

      const count = await db.invite.count({ where: { id: invite?.id } });

      expect(count).toEqual(1);
    });
  });
});
