import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { TeamMembers } from './team-members.server.ts';

describe('TeamMembers', () => {
  describe('list', () => {
    it('returns team members and filter them', async () => {
      const owner = await userFactory({
        traits: ['clark-kent'],
        attributes: { id: '1', picture: 'https://img.com/a.png' },
      });
      const member = await userFactory({
        traits: ['bruce-wayne'],
        attributes: { id: '2', picture: 'https://img.com/b.png' },
      });
      const reviewer = await userFactory({
        traits: ['peter-parker'],
        attributes: { id: '3', picture: 'https://img.com/c.png' },
      });
      const team = await teamFactory({
        owners: [owner],
        members: [member],
        reviewers: [reviewer],
        attributes: { slug: 'my-team' },
      });
      const other = await userFactory();
      await teamFactory({ owners: [other] });

      const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);

      const data = await TeamMembers.for(authorizedTeam).list({}, 1);
      expect(data.pagination).toEqual({ current: 1, total: 1 });

      expect(data.members).toEqual([
        { id: '2', name: 'Bruce Wayne', role: 'MEMBER', picture: 'https://img.com/b.png' },
        { id: '1', name: 'Clark Kent', role: 'OWNER', picture: 'https://img.com/a.png' },
        { id: '3', name: 'Peter Parker', role: 'REVIEWER', picture: 'https://img.com/c.png' },
      ]);

      const filtered = await TeamMembers.for(authorizedTeam).list({ query: 'kent' }, 1);
      expect(filtered.members).toEqual([
        { id: '1', name: 'Clark Kent', role: 'OWNER', picture: 'https://img.com/a.png' },
      ]);

      const roleFiltered = await TeamMembers.for(authorizedTeam).list({ role: 'MEMBER' }, 1);
      expect(roleFiltered.members).toEqual([
        { id: '2', name: 'Bruce Wayne', role: 'MEMBER', picture: 'https://img.com/b.png' },
      ]);
    });
  });

  describe('leave', () => {
    it('leaves the organization as member', async () => {
      const owner = await userFactory();
      const member = await userFactory();
      const team = await teamFactory({ owners: [owner], members: [member] });

      const authorizedMember = await getAuthorizedTeam(member.id, team.slug);
      await TeamMembers.for(authorizedMember).leave();

      const authorizedOwner = await getAuthorizedTeam(owner.id, team.slug);
      const data = await TeamMembers.for(authorizedOwner).list({}, 1);
      expect(data.members).toEqual([{ id: owner.id, name: owner.name, role: 'OWNER', picture: owner.picture }]);
    });

    it('throws an error when user a owner of the team', async () => {
      const owner = await userFactory();
      const team = await teamFactory({ owners: [owner] });

      const authorizedOwner = await getAuthorizedTeam(owner.id, team.slug);
      await expect(TeamMembers.for(authorizedOwner).leave()).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('remove', () => {
    it('removes a member from the team', async () => {
      const owner = await userFactory();
      const member = await userFactory();
      const team = await teamFactory({ owners: [owner], members: [member] });

      const authorizedOwner = await getAuthorizedTeam(owner.id, team.slug);
      await TeamMembers.for(authorizedOwner).remove(member.id);

      const data = await TeamMembers.for(authorizedOwner).list({}, 1);
      expect(data.members).toEqual([{ id: owner.id, name: owner.name, role: 'OWNER', picture: owner.picture }]);
    });

    it('throws an error when user tries to remove itself', async () => {
      const owner = await userFactory();
      const team = await teamFactory({ owners: [owner] });

      const authorizedOwner = await getAuthorizedTeam(owner.id, team.slug);
      await expect(TeamMembers.for(authorizedOwner).remove(owner.id)).rejects.toThrowError(ForbiddenOperationError);
    });
  });

  describe('changeRole', () => {
    it('changes the role of a member when user has owner role', async () => {
      const owner = await userFactory();
      const member = await userFactory();
      const team = await teamFactory({ owners: [owner], members: [member] });

      const authorizedOwner = await getAuthorizedTeam(owner.id, team.slug);
      await TeamMembers.for(authorizedOwner).changeRole(member.id, 'REVIEWER');

      const data = await TeamMembers.for(authorizedOwner).list({ query: member.name }, 1);
      expect(data.members).toEqual([{ id: member.id, name: member.name, role: 'REVIEWER', picture: member.picture }]);
    });

    it('throws an error when user updates its own role of the team', async () => {
      const owner = await userFactory();
      const team = await teamFactory({ owners: [owner] });

      const authorizedOwner = await getAuthorizedTeam(owner.id, team.slug);
      await expect(TeamMembers.for(authorizedOwner).changeRole(owner.id, 'REVIEWER')).rejects.toThrowError(
        ForbiddenOperationError,
      );
    });
  });
});
