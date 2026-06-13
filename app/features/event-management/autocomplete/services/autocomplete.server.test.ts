import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { getAuthorizedEvent, getAuthorizedTeam } from '~/shared/authorization/authorization.server.ts';
import { EventNotFoundError, ForbiddenOperationError } from '~/shared/errors.server.ts';
import type { Event, Team, User } from '../../../../../prisma/generated/client.ts';
import { Autocomplete, parseUrlFilters } from './autocomplete.server.ts';

describe('Autocomplete for event management', () => {
  let owner: User;
  let member: User;
  let reviewer: User;
  let speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    reviewer = await userFactory({ traits: ['peter-parker'] });
    speaker = await userFactory({ attributes: { name: 'Tony Stark' } });
    team = await teamFactory({ owners: [owner], members: [member], reviewers: [reviewer] });
    event = await eventFactory({ team });
  });

  describe('#search', () => {
    describe('when user has access to event', () => {
      it('returns empty array when no query provided', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const results = await Autocomplete.for(authorizedEvent).search({
          query: '',
          kind: ['proposals', 'speakers'],
        });

        expect(results).toEqual([]);
      });

      it('returns empty array when no kinds specified', async () => {
        const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
        const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

        const results = await Autocomplete.for(authorizedEvent).search({
          query: 'test',
          kind: [],
        });

        expect(results).toEqual([]);
      });

      describe('proposal search (kind = "proposals")', () => {
        it('returns matching proposals with distinct id/routeId and structured speakers', async () => {
          const talk = await talkFactory({ speakers: [speaker] });
          const proposal = await proposalFactory({ event, talk, attributes: { title: 'React Best Practices' } });

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'React',
            kind: ['proposals'],
          });

          expect(results).toEqual([
            {
              kind: 'proposals',
              id: proposal.id,
              routeId: proposal.routeId,
              title: 'React Best Practices',
              speakers: [{ name: speaker.name, picture: speaker.picture }],
            },
          ]);
        });

        it('limits proposals to 3 results', async () => {
          for (let i = 1; i <= 5; i++) {
            const talk = await talkFactory({ speakers: [speaker] });
            await proposalFactory({ event, talk, attributes: { title: `React Tutorial ${i}` } });
          }

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'React',
            kind: ['proposals'],
          });

          expect(results).toHaveLength(3);
          expect(results.every((r) => r.kind === 'proposals')).toBe(true);
        });

        it('includes multiple structured speakers when displayProposalsSpeakers is true', async () => {
          const speaker2 = await userFactory({ attributes: { name: 'Bruce Banner' } });
          const talk = await talkFactory({ speakers: [speaker, speaker2] });
          await proposalFactory({ event, talk, attributes: { title: 'Advanced React' } });

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'Advanced',
            kind: ['proposals'],
          });

          const proposalResult = results[0];
          expect(proposalResult.kind === 'proposals' && proposalResult.speakers).toEqual([
            { name: 'Bruce Banner', picture: speaker2.picture },
            { name: 'Tony Stark', picture: speaker.picture },
          ]);
        });

        it('returns empty proposal speakers when displayProposalsSpeakers is false', async () => {
          const eventWithoutSpeakers = await eventFactory({ team, attributes: { displayProposalsSpeakers: false } });
          const talk = await talkFactory({ speakers: [speaker] });
          await proposalFactory({ event: eventWithoutSpeakers, talk, attributes: { title: 'Advanced React' } });

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, eventWithoutSpeakers.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'Advanced',
            kind: ['proposals'],
          });

          const proposalResult = results[0];
          expect(proposalResult.kind === 'proposals' && proposalResult.speakers).toEqual([]);
        });

        it('does not return proposals when kind is not included', async () => {
          const talk = await talkFactory({ speakers: [speaker] });
          await proposalFactory({ event, talk, attributes: { title: 'React Best Practices' } });

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'React',
            kind: ['speakers'],
          });

          expect(results.filter((r) => r.kind === 'proposals')).toHaveLength(0);
        });
      });

      describe('speaker search (kind = "speakers")', () => {
        it('returns matching speakers when searching by name', async () => {
          const eventSpeaker = await eventSpeakerFactory({ event, attributes: { name: 'John Doe' } });

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'John',
            kind: ['speakers'],
          });

          expect(results).toEqual([
            {
              kind: 'speakers',
              id: eventSpeaker.id,
              name: eventSpeaker.name,
              company: eventSpeaker.company,
              picture: eventSpeaker.picture,
            },
          ]);
        });

        it('returns matching speakers when searching by exact email (case insensitive)', async () => {
          const eventSpeaker = await eventSpeakerFactory({
            event,
            attributes: { name: 'John Doe', email: 'john.doe@example.com' },
          });

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'JOHN.DOE@EXAMPLE.COM',
            kind: ['speakers'],
          });

          expect(results).toEqual([
            {
              kind: 'speakers',
              id: eventSpeaker.id,
              name: eventSpeaker.name,
              company: eventSpeaker.company,
              picture: eventSpeaker.picture,
            },
          ]);
        });

        it('limits speakers to 3 results', async () => {
          for (let i = 1; i <= 5; i++) {
            await eventSpeakerFactory({ event, attributes: { name: `John Speaker ${i}` } });
          }

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'John',
            kind: ['speakers'],
          });

          expect(results).toHaveLength(3);
          expect(results.every((r) => r.kind === 'speakers')).toBe(true);
        });

        it('does not return speakers when kind is not included', async () => {
          await eventSpeakerFactory({ event, attributes: { name: 'John Doe' } });

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'John',
            kind: ['proposals'],
          });

          expect(results.filter((r) => r.kind === 'speakers')).toHaveLength(0);
        });

        describe('blind review (displayProposalsSpeakers is false)', () => {
          it('returns speakers for an edit-capable caller (owner) regardless of the setting', async () => {
            const blindEvent = await eventFactory({ team, attributes: { displayProposalsSpeakers: false } });
            const eventSpeaker = await eventSpeakerFactory({ event: blindEvent, attributes: { name: 'John Doe' } });

            const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
            const authorizedEvent = await getAuthorizedEvent(authorizedTeam, blindEvent.slug);

            const results = await Autocomplete.for(authorizedEvent).search({
              query: 'John',
              kind: ['speakers'],
            });

            expect(results).toEqual([
              {
                kind: 'speakers',
                id: eventSpeaker.id,
                name: eventSpeaker.name,
                company: eventSpeaker.company,
                picture: eventSpeaker.picture,
              },
            ]);
          });

          it('returns no speakers for a non-edit-capable caller (reviewer)', async () => {
            const blindEvent = await eventFactory({ team, attributes: { displayProposalsSpeakers: false } });
            await eventSpeakerFactory({ event: blindEvent, attributes: { name: 'John Doe' } });

            const authorizedTeam = await getAuthorizedTeam(reviewer.id, team.slug);
            const authorizedEvent = await getAuthorizedEvent(authorizedTeam, blindEvent.slug);

            const results = await Autocomplete.for(authorizedEvent).search({
              query: 'John',
              kind: ['speakers'],
            });

            expect(results.filter((r) => r.kind === 'speakers')).toHaveLength(0);
          });
        });
      });

      describe('combined search', () => {
        it('returns both proposals and speakers when both kinds are specified', async () => {
          const talk = await talkFactory({ speakers: [speaker] });
          const proposal = await proposalFactory({ event, talk, attributes: { title: 'React Testing' } });
          const eventSpeaker = await eventSpeakerFactory({ event, attributes: { name: 'React Expert' } });

          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);

          const results = await Autocomplete.for(authorizedEvent).search({
            query: 'React',
            kind: ['proposals', 'speakers'],
          });

          expect(results).toHaveLength(2);

          const proposalResult = results.find((r) => r.kind === 'proposals');
          expect(proposalResult).toEqual({
            kind: 'proposals',
            id: proposal.id,
            routeId: proposal.routeId,
            title: 'React Testing',
            speakers: [{ name: speaker.name, picture: speaker.picture }],
          });

          const speakerResult = results.find((r) => r.kind === 'speakers');
          expect(speakerResult).toEqual({
            kind: 'speakers',
            id: eventSpeaker.id,
            name: eventSpeaker.name,
            company: eventSpeaker.company,
            picture: eventSpeaker.picture,
          });
        });
      });
    });

    describe('when user does not have access to event', () => {
      it('throws ForbiddenOperationError for non-member', async () => {
        const outsider = await userFactory();

        await expect(async () => {
          const authorizedTeam = await getAuthorizedTeam(outsider.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
          await Autocomplete.for(authorizedEvent).search({
            query: 'test',
            kind: ['proposals'],
          });
        }).rejects.toThrow(ForbiddenOperationError);
      });
    });

    describe('when event does not exist', () => {
      it('throws error for non-existent event', async () => {
        await expect(async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, team.slug);
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, 'non-existent');
          await Autocomplete.for(authorizedEvent).search({
            query: 'test',
            kind: ['proposals'],
          });
        }).rejects.toThrow(EventNotFoundError);
      });
    });

    describe('when team does not exist', () => {
      it('throws error for non-existent team', async () => {
        await expect(async () => {
          const authorizedTeam = await getAuthorizedTeam(owner.id, 'non-existent');
          const authorizedEvent = await getAuthorizedEvent(authorizedTeam, event.slug);
          await Autocomplete.for(authorizedEvent).search({
            query: 'test',
            kind: ['proposals'],
          });
        }).rejects.toThrow(ForbiddenOperationError);
      });
    });
  });
});

describe('parseUrlFilters', () => {
  it('parses valid URL with query and kind parameters', () => {
    const url = new URL('https://example.com/search?query=test&kind=proposals&kind=speakers');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: 'test', kind: ['proposals', 'speakers'] });
  });

  it('parses URL with only query parameter', () => {
    const url = new URL('https://example.com/search?query=react');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: 'react', kind: [] });
  });

  it('parses URL with only kind parameter', () => {
    const url = new URL('https://example.com/search?kind=speakers');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ kind: ['speakers'] });
  });

  it('returns default values for URL without search parameters', () => {
    const url = new URL('https://example.com/search');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ kind: [] });
  });

  it('rejects invalid kind values at parse time', () => {
    const url = new URL('https://example.com/search?kind=proposals&kind=speakers&kind=events');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ kind: [] });
  });

  it('handles URL encoded parameters', () => {
    const url = new URL('https://example.com/search?query=react%20testing&kind=proposals');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: 'react testing', kind: ['proposals'] });
  });

  it('handles empty query parameter', () => {
    const url = new URL('https://example.com/search?query=&kind=proposals');
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: undefined, kind: ['proposals'] });
  });
});
