import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { submissionPassFactory } from 'tests/factories/submission-passes.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { db } from '../../../../../prisma/db.server.ts';
import type { Event, Team, User } from '../../../../../prisma/generated/client.ts';
import { getSharedServerEnv } from '../../../../../servers/environment.server.ts';
import { SubmissionPasses } from './submission-passes.server.ts';

const { APP_URL } = getSharedServerEnv();

describe('SubmissionPasses', () => {
  let owner: User;
  let member: User;
  let reviewer: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory();
    member = await userFactory();
    reviewer = await userFactory();
    team = await teamFactory({ owners: [owner], members: [member], reviewers: [reviewer] });
    event = await eventFactory({ team });

    const otherEvent = await eventFactory({ team });
    await submissionPassFactory({ event: otherEvent });
  });

  const passesFor = async (user: User) => {
    const authorizedTeam = await getAuthorizedTeam(user.id, team.slug);
    const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
    return SubmissionPasses.for(authorizedEvent);
  };

  describe('#list', () => {
    it('lists used passes with their holder', async () => {
      const holder = await userFactory();
      const pass = await submissionPassFactory({ event, user: holder });
      const passes = await passesFor(owner);

      const { unused, used } = await passes.list();

      expect(unused).toEqual([]);
      expect(used).toEqual([
        {
          id: pass.id,
          label: pass.label,
          holder: { name: holder.name, picture: holder.picture, eventSpeakerId: null },
        },
      ]);
    });

    it('links the holder to their event speaker when one exists for the event', async () => {
      const holder = await userFactory();
      const otherEvent = await eventFactory({ team });
      await eventSpeakerFactory({ event: otherEvent, user: holder });
      const eventSpeaker = await eventSpeakerFactory({ event, user: holder });
      await submissionPassFactory({ event, user: holder });
      const passes = await passesFor(owner);

      const { used } = await passes.list();

      expect(used.map((pass) => pass.holder.eventSpeakerId)).toEqual([eventSpeaker.id]);
    });
  });

  describe('#create', () => {
    it('creates an unused pass with its link', async () => {
      const passes = await passesFor(owner);

      const created = await passes.create({ label: 'Keynote Jane Doe' });

      const { unused } = await passes.list();
      expect(unused).toEqual([
        { id: created.id, label: 'Keynote Jane Doe', link: `${APP_URL}/invite/pass/${created.code}` },
      ]);
      expect(created.link).toBe(`${APP_URL}/invite/pass/${created.code}`);
    });
  });

  describe('#delete', () => {
    it('deletes an unused pass', async () => {
      const pass = await submissionPassFactory({ event });
      const passes = await passesFor(owner);

      await passes.delete(pass.id);

      const { unused } = await passes.list();
      expect(unused).toEqual([]);
    });

    it('deletes a used pass and keeps the holder proposals', async () => {
      const holder = await userFactory();
      const pass = await submissionPassFactory({ event, user: holder });
      const talk = await talkFactory({ speakers: [holder] });
      const proposal = await proposalFactory({ event, talk });
      const passes = await passesFor(owner);

      await passes.delete(pass.id);

      const { used } = await passes.list();
      expect(used).toEqual([]);
      const kept = await db.proposal.findUnique({ where: { id: proposal.id } });
      expect(kept).not.toBeNull();
    });

    it('does not delete a pass of another event', async () => {
      const otherEvent = await eventFactory({ team });
      const otherPass = await submissionPassFactory({ event: otherEvent });
      const passes = await passesFor(owner);

      await passes.delete(otherPass.id);

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
      const otherPasses = SubmissionPasses.for(await getAuthorizedEvent(authorizedTeam, otherEvent.slug));
      const { unused } = await otherPasses.list();
      expect(unused.map((p) => p.id)).toContain(otherPass.id);
    });
  });

  describe('authorization', () => {
    it('allows team members', async () => {
      const passes = await passesFor(member);

      await passes.create({ label: 'Late speaker' });

      const { unused } = await passes.list();
      expect(unused.map((pass) => pass.label)).toEqual(['Late speaker']);
    });

    it('refuses reviewers', async () => {
      const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
      const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

      expect(() => SubmissionPasses.for(authorizedEvent)).toThrow(ForbiddenOperationError);
    });

    it('refuses users outside the event team', async () => {
      const user = await userFactory();

      await expect(passesFor(user)).rejects.toThrow(ForbiddenOperationError);
    });
  });
});
