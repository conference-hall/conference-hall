import { OpenPlanner } from './open-planner.server.ts';

const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

describe('OpenPlanner integration', () => {
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

  describe('#checkConfiguration', () => {
    it('successfully posts sessions and speakers', async () => {
      const eventId = '123';
      const apiKey = '456';

      fetchMock.mockResolvedValue({ ok: true, json: () => ({ success: true }) });

      const result = await OpenPlanner.checkConfiguration(eventId, apiKey);

      expect(result).toEqual({ success: true });

      expect(fetchMock).toHaveBeenCalledWith('https://api.openplanner.fr/v1/123/sessions-speakers?apiKey=456', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessions: [], speakers: [] }),
      });
    });

    it('returns an error when the apiKey or eventId are invalid', async () => {
      const result1 = await OpenPlanner.checkConfiguration('eventId', '');
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Invalid event id or API key.');

      const result2 = await OpenPlanner.checkConfiguration('eventId', '');
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Invalid event id or API key.');
    });

    it('returns an error when the OpenPlanner call returns a 401 status code', async () => {
      const eventId = '123';
      const apiKey = '456';

      fetchMock.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => ({ success: false, error: 'Something wrong' }),
      });

      const result = await OpenPlanner.checkConfiguration(eventId, apiKey);

      expect(result).toEqual({ success: false, error: 'Invalid OpenPlanner API key.' });
      expect(fetchMock).toHaveBeenCalled();
    });

    it('returns an error when the OpenPlanner call returns a 400 status code', async () => {
      const eventId = '123';
      const apiKey = '456';

      fetchMock.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => ({ success: false, error: 'Something wrong' }),
      });

      const result = await OpenPlanner.checkConfiguration(eventId, apiKey);

      expect(result).toEqual({ success: false, error: 'Invalid OpenPlanner event id.' });
      expect(fetchMock).toHaveBeenCalled();
    });

    it('returns an error when the OpenPlanner call returns an other status code', async () => {
      const eventId = '123';
      const apiKey = '456';

      fetchMock.mockResolvedValue({
        ok: false,
        status: 500,
        json: () => ({ success: false, error: 'Something wrong' }),
      });

      const result = await OpenPlanner.checkConfiguration(eventId, apiKey);

      expect(result).toEqual({ success: false, error: 'Unknown error.' });
      expect(fetchMock).toHaveBeenCalled();
    });

    it('returns an error when the OpenPlanner call fails unexpectedly"', async () => {
      const eventId = '123';
      const apiKey = '456';

      fetchMock.mockRejectedValue(new Error('Boom!'));

      const result = await OpenPlanner.checkConfiguration(eventId, apiKey);

      expect(result).toEqual({ success: false, error: 'Boom!' });
      expect(fetchMock).toHaveBeenCalled();
    });
  });
});
