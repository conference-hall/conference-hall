import { OpenPlanner } from './open-planner.ts';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('OpenPlanner integration', () => {
  beforeEach(async () => {
    fetchMock.mockReset();
  });

  describe('#postSessionsAndSpeakers', () => {
    it('successfully posts sessions and speakers', async () => {
      const eventId = '123';
      const apiKey = '456';
      const payload = {
        sessions: [{ id: 'idSession', title: 'title!', speakerIds: ['idSpeaker'] }],
        speakers: [{ id: 'idSpeaker', name: 'name!', socials: [] }],
      };

      fetchMock.mockResolvedValue({ ok: true, json: () => ({ success: true }) });

      await OpenPlanner.postSessionsAndSpeakers(eventId, apiKey, payload);

      expect(fetchMock).toHaveBeenCalledWith('https://api.openplanner.fr/v1/123/sessions-speakers?apiKey=456', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    });
  });
});
