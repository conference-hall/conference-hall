import { MemoryCacheLayer } from '../cache/memory-cache-layer.ts';
import { defineFlagsConfig, FlagsClient } from './flags-client.ts';
import { FlagsStorage } from './flags-storage.ts';

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
  let storage: FlagsStorage;

  beforeEach(() => {
    storage = new FlagsStorage(new MemoryCacheLayer());
    client = new FlagsClient(flagsConfig, storage);
  });

  afterEach(async () => {
    await storage.clear();
  });

  describe('#load', () => {
    it('loads default values if not present in storage', async () => {
      await client.load();

      await expect(storage.getValue('new-dashboard')).resolves.toBe(true);
      await expect(storage.getValue('max-items-limit')).resolves.toBe(50);
    });

    it('deletes old flags not present in config', async () => {
      await storage.setValue('old-flag', 'some-value');
      await storage.setValue('new-dashboard', true);

      await client.load();

      await expect(storage.getValue('old-flag')).resolves.toBeNull();
    });

    it('does not delete flags present in config', async () => {
      await storage.setValue('new-dashboard', true);
      await storage.setValue('max-items-limit', 100);

      await client.load();

      await expect(storage.getValue('new-dashboard')).resolves.toBe(true);
      await expect(storage.getValue('max-items-limit')).resolves.toBe(100);
    });
  });

  describe('#get', () => {
    it('gets the value from storage if present', async () => {
      await storage.setValue('new-dashboard', false);
      const value = await client.get('new-dashboard');
      expect(value).toBe(false);
    });

    it('returns default value if not present in storage', async () => {
      const value = await client.get('new-dashboard');
      expect(value).toBe(true);
    });
  });

  describe('#set', () => {
    it('sets the value in storage', async () => {
      await client.set('new-dashboard', false);
      await expect(storage.getValue('new-dashboard')).resolves.toBe(false);
    });
  });

  describe('#all', () => {
    it('gets all values from storage', async () => {
      await storage.setValue('new-dashboard', false);
      await storage.setValue('max-items-limit', 100);

      const values = await client.all();

      expect(values).toEqual({ 'new-dashboard': false, 'max-items-limit': 100 });
    });

    it('returns default values for keys not in storage', async () => {
      const values = await client.all();

      expect(values).toEqual({ 'new-dashboard': true, 'max-items-limit': 50 });
    });
  });

  describe('#withTag', () => {
    it('returns only flags with the given tag and their values', async () => {
      await storage.setValue('new-dashboard', false);

      const values = await client.withTag('frontend');

      expect(values).toEqual({ 'new-dashboard': false });
    });

    it('returns default values for flags with the given tag not in storage', async () => {
      const values = await client.withTag('frontend');

      expect(values).toEqual({ 'new-dashboard': true });
    });
  });

  describe('#resetDefaults', () => {
    it('resets all flags to their default values', async () => {
      await storage.setValue('new-dashboard', false);
      await storage.setValue('max-items-limit', 100);

      await client.resetDefaults();

      await expect(storage.getAllValues()).resolves.toEqual({
        'new-dashboard': true,
        'max-items-limit': 50,
      });
    });
  });
});
