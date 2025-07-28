import type { Event, Team, User } from '@prisma/client';
import { eventSpeakerFactory } from 'tests/factories/event-speakers.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ForbiddenOperationError } from '~/shared/errors.server.ts';
import { Autocomplete, parseUrlFilters } from './autocomplete.server.ts';

describe('Autocomplete for event management', () => {
  let owner: User;
  let member: User;
  let speaker: User;
  let team: Team;
  let event: Event;

  beforeEach(async () => {
    owner = await userFactory({ traits: ['clark-kent'] });
    member = await userFactory({ traits: ['bruce-wayne'] });
    speaker = await userFactory({ traits: ['peter-parker'] });
    team = await teamFactory({ owners: [owner], members: [member] });
    event = await eventFactory({ team });
  });

  describe('#search', () => {
    describe('when user has access to event', () => {
      it('returns empty array when no query provided', async () => {
        const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
          query: '',
          type: ['proposals', 'speakers'],
        });

        expect(results).toEqual([]);
      });

      it('returns empty array when no types specified', async () => {
        const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
          query: 'test',
          type: [],
        });

        expect(results).toEqual([]);
      });

      describe('proposal search', () => {
        it('returns matching proposals when searching by title', async () => {
          const talk = await talkFactory({ speakers: [speaker] });
          const proposal = await proposalFactory({ event, talk, attributes: { title: 'React Best Practices' } });

          const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
            query: 'React',
            type: ['proposals'],
          });

          expect(results).toEqual([
            { section: 'proposals', id: proposal.id, title: 'React Best Practices', description: 'Peter Parker' },
          ]);
        });

        it('limits proposals to 3 results', async () => {
          for (let i = 1; i <= 5; i++) {
            const talk = await talkFactory({ speakers: [speaker] });
            await proposalFactory({ event, talk, attributes: { title: `React Tutorial ${i}` } });
          }

          const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
            query: 'React',
            type: ['proposals'],
          });

          expect(results).toHaveLength(3);
          expect(results.every((r) => r.section === 'proposals')).toBe(true);
        });

        it('includes multiple speakers in description when displayProposalsSpeakers is true', async () => {
          const speaker2 = await userFactory({ attributes: { name: 'Tony Stark' } });
          const talk = await talkFactory({ speakers: [speaker, speaker2] });
          const proposal = await proposalFactory({ event, talk, attributes: { title: 'Advanced React' } });

          const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
            query: 'Advanced',
            type: ['proposals'],
          });

          expect(results[0]).toEqual({
            section: 'proposals',
            id: proposal.id,
            title: 'Advanced React',
            description: 'Peter Parker, Tony Stark',
          });
        });

        it('does not include speakers in proposal description when displayProposalsSpeakers is false', async () => {
          const eventWithoutSpeakers = await eventFactory({ team, attributes: { displayProposalsSpeakers: false } });
          const speaker2 = await userFactory({ attributes: { name: 'Tony Stark' } });
          const talk = await talkFactory({ speakers: [speaker, speaker2] });
          const proposal = await proposalFactory({
            event: eventWithoutSpeakers,
            talk,
            attributes: { title: 'Advanced React' },
          });

          const results = await Autocomplete.for(owner.id, team.slug, eventWithoutSpeakers.slug).search({
            query: 'Advanced',
            type: ['proposals'],
          });

          expect(results[0]).toEqual({
            section: 'proposals',
            id: proposal.id,
            title: 'Advanced React',
            description: '',
          });
        });

        it('does not return proposals when type is not included', async () => {
          const talk = await talkFactory({ speakers: [speaker] });
          await proposalFactory({ event, talk, attributes: { title: 'React Best Practices' } });

          const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
            query: 'React',
            type: ['speakers'],
          });

          expect(results.filter((r) => r.section === 'proposals')).toHaveLength(0);
        });
      });

      describe('speaker search', () => {
        it('returns matching speakers when searching by name', async () => {
          const eventSpeaker = await eventSpeakerFactory({
            event,
            attributes: {
              name: 'John Doe',
              company: 'Tech Corp',
            },
          });

          const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
            query: 'John',
            type: ['speakers'],
          });

          expect(results).toEqual([
            { section: 'speakers', id: eventSpeaker.id, title: 'John Doe', description: 'Tech Corp' },
          ]);
        });

        it('limits speakers to 3 results', async () => {
          // Create 5 speakers with similar names
          for (let i = 1; i <= 5; i++) {
            await eventSpeakerFactory({ event, attributes: { name: `John Speaker ${i}` } });
          }

          const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
            query: 'John',
            type: ['speakers'],
          });

          expect(results).toHaveLength(3);
          expect(results.every((r) => r.section === 'speakers')).toBe(true);
        });

        it('does not return speakers when type is not included', async () => {
          await eventSpeakerFactory({ event, attributes: { name: 'John Doe' } });

          const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
            query: 'John',
            type: ['proposals'],
          });

          expect(results.filter((r) => r.section === 'speakers')).toHaveLength(0);
        });

        it('does not return speakers when displayProposalsSpeakers is false', async () => {
          const eventWithoutSpeakers = await eventFactory({ team, attributes: { displayProposalsSpeakers: false } });
          await eventSpeakerFactory({ event: eventWithoutSpeakers, attributes: { name: 'John Doe' } });

          const results = await Autocomplete.for(owner.id, team.slug, eventWithoutSpeakers.slug).search({
            query: 'John',
            type: ['speakers'],
          });

          expect(results.filter((r) => r.section === 'speakers')).toHaveLength(0);
        });
      });

      describe('combined search', () => {
        it('returns both proposals and speakers when both types are specified', async () => {
          const talk = await talkFactory({ speakers: [speaker] });
          const proposal = await proposalFactory({ event, talk, attributes: { title: 'React Testing' } });
          const eventSpeaker = await eventSpeakerFactory({
            event,
            attributes: { name: 'React Expert', company: 'Tech Corp' },
          });

          const results = await Autocomplete.for(owner.id, team.slug, event.slug).search({
            query: 'React',
            type: ['proposals', 'speakers'],
          });

          expect(results).toHaveLength(2);

          const proposalResult = results.find((r) => r.section === 'proposals');
          expect(proposalResult).toEqual({
            section: 'proposals',
            id: proposal.id,
            title: 'React Testing',
            description: 'Peter Parker',
          });

          const speakerResult = results.find((r) => r.section === 'speakers');
          expect(speakerResult).toEqual({
            section: 'speakers',
            id: eventSpeaker.id,
            title: 'React Expert',
            description: 'Tech Corp',
          });
        });
      });
    });

    describe('when user does not have access to event', () => {
      it('throws ForbiddenOperationError for non-member', async () => {
        const outsider = await userFactory();

        await expect(
          Autocomplete.for(outsider.id, team.slug, event.slug).search({
            query: 'test',
            type: ['proposals'],
          }),
        ).rejects.toThrow(ForbiddenOperationError);
      });
    });

    describe('when event does not exist', () => {
      it('throws error for non-existent event', async () => {
        await expect(
          Autocomplete.for(owner.id, team.slug, 'non-existent').search({
            query: 'test',
            type: ['proposals'],
          }),
        ).rejects.toThrow();
      });
    });

    describe('when team does not exist', () => {
      it('throws error for non-existent team', async () => {
        await expect(
          Autocomplete.for(owner.id, 'non-existent', event.slug).search({
            query: 'test',
            type: ['proposals'],
          }),
        ).rejects.toThrow();
      });
    });
  });
});

describe('parseUrlFilters', () => {
  it('parses valid URL with query and type parameters', () => {
    const url = 'https://example.com/search?query=test&type=proposals&type=speakers';
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: 'test', type: ['proposals', 'speakers'] });
  });

  it('parses URL with only query parameter', () => {
    const url = 'https://example.com/search?query=react';
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: 'react', type: [] });
  });

  it('parses URL with only type parameter', () => {
    const url = 'https://example.com/search?type=speakers';
    const result = parseUrlFilters(url);

    expect(result).toEqual({ type: ['speakers'] });
  });

  it('returns default values for URL without search parameters', () => {
    const url = 'https://example.com/search';
    const result = parseUrlFilters(url);

    expect(result).toEqual({ type: [] });
  });

  it('handles multiple type parameters', () => {
    const url = 'https://example.com/search?type=proposals&type=speakers&type=events';
    const result = parseUrlFilters(url);

    expect(result).toEqual({ type: ['proposals', 'speakers', 'events'] });
  });

  it('handles URL encoded parameters', () => {
    const url = 'https://example.com/search?query=react%20testing&type=proposals';
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: 'react testing', type: ['proposals'] });
  });

  it('handles empty query parameter', () => {
    const url = 'https://example.com/search?query=&type=proposals';
    const result = parseUrlFilters(url);

    expect(result).toEqual({ query: undefined, type: ['proposals'] });
  });
});
