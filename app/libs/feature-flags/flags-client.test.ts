import { FlagsClient, defineFlagsConfig } from './flags-client.ts';

const flagsConfig = defineFlagsConfig({
  'new-dashboard': {
    description: 'Enables the new dashboard UI',
    type: 'boolean',
    defaultValue: true,
    tags: ['frontend'],
  },
  'max-items-limit': {
    description: 'Max items allowed per team',
    type: 'number',
    defaultValue: 50,
    tags: ['backend'],
  },
});

describe('FlagsClient', () => {
  let client: FlagsClient<typeof flagsConfig>;

  const mockStorage = {
    getValue: vi.fn(),
    getValues: vi.fn(),
    getAllValues: vi.fn(),
    setValue: vi.fn(),
    deleteValue: vi.fn(),
  };

  beforeEach(() => {
    client = new FlagsClient(flagsConfig, mockStorage);
  });

  describe('#load', () => {
    it('loads default values if not present in storage', async () => {
      mockStorage.getValue.mockResolvedValue(undefined);
      mockStorage.getAllValues.mockResolvedValue({});

      await client.load();

      expect(mockStorage.setValue).toHaveBeenCalledWith('new-dashboard', true, flagsConfig['new-dashboard']);
      expect(mockStorage.setValue).toHaveBeenCalledWith('max-items-limit', 50, flagsConfig['max-items-limit']);
    });

    it('deletes old flags not present in config', async () => {
      mockStorage.getAllValues.mockResolvedValue({
        'old-flag': 'some-value',
        'new-dashboard': true,
      });

      await client.load();

      expect(mockStorage.deleteValue).toHaveBeenCalledWith('old-flag');
    });

    it('does not delete flags present in config', async () => {
      mockStorage.getAllValues.mockResolvedValue({
        'new-dashboard': true,
        'max-items-limit': 50,
      });

      await client.load();

      expect(mockStorage.deleteValue).not.toHaveBeenCalled();
    });
  });

  describe('#get', () => {
    it('gets the value from storage if present', async () => {
      mockStorage.getValue.mockResolvedValueOnce(false);
      const value = await client.get('new-dashboard');
      expect(value).toBe(false);
    });

    it('returns default value if not present in storage', async () => {
      mockStorage.getValue.mockResolvedValueOnce(undefined);
      const value = await client.get('new-dashboard');
      expect(value).toBe(true);
    });
  });

  describe('#set', () => {
    it('sets the value in storage', async () => {
      await client.set('new-dashboard', false);
      expect(mockStorage.setValue).toHaveBeenCalledWith('new-dashboard', false, flagsConfig['new-dashboard']);
    });
  });

  describe('#all', () => {
    it('gets all values from storage', async () => {
      mockStorage.getValues.mockResolvedValue({
        'new-dashboard': false,
        'max-items-limit': 100,
      });

      const values = await client.all();

      expect(values).toEqual({
        'new-dashboard': false,
        'max-items-limit': 100,
      });
    });

    it('returns default values for keys not in storage', async () => {
      mockStorage.getValues.mockResolvedValue({});

      const values = await client.all();

      expect(values).toEqual({
        'new-dashboard': true,
        'max-items-limit': 50,
      });
    });
  });

  describe('#withTag', () => {
    it('returns only flags with the given tag and their values', async () => {
      mockStorage.getValues.mockResolvedValue({
        'new-dashboard': false,
      });

      const values = await client.withTag('frontend');

      expect(values).toEqual({
        'new-dashboard': false,
      });
    });

    it('returns default values for flags with the given tag not in storage', async () => {
      mockStorage.getValues.mockResolvedValue({});

      const values = await client.withTag('frontend');

      expect(values).toEqual({
        'new-dashboard': true,
      });
    });
  });

  describe('#resetDefaults', () => {
    it('resets all flags to their default values', async () => {
      await client.resetDefaults();
      expect(mockStorage.setValue).toHaveBeenCalledTimes(Object.keys(flagsConfig).length);
      expect(mockStorage.setValue).toHaveBeenCalledWith('new-dashboard', true, flagsConfig['new-dashboard']);
      expect(mockStorage.setValue).toHaveBeenCalledWith('max-items-limit', 50, flagsConfig['max-items-limit']);
    });
  });
});
