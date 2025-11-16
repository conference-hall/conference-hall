import type { FlagsStorage } from './flags-storage.ts';
import type {
  FlagKey,
  FlagsConfig,
  FlagTaggedConfig,
  FlagTaggedKey,
  FlagTaggedValues,
  FlagValue,
  FlagValues,
  Tags,
} from './types.ts';

export class FlagsClient<C extends FlagsConfig> {
  constructor(
    private config: C,
    private storage: FlagsStorage,
  ) {}

  getConfig(): C {
    return this.config;
  }

  async load() {
    const allStoredValues = await this.storage.getAllValues();
    const configKeys = new Set(Object.keys(this.config));

    for (const key of Object.keys(allStoredValues)) {
      if (!configKeys.has(key)) {
        await this.storage.deleteValue(key);
      }
    }

    for (const [key, config] of Object.entries(this.config)) {
      const value = await this.storage.getValue(key);
      if (value === null || value === undefined) {
        await this.storage.setValue(key, config.defaultValue);
      }
    }
  }

  async get<K extends FlagKey<C>>(key: K): Promise<FlagValue<C, K>> {
    const config = this.config[key];
    const value = await this.storage.getValue(String(key));
    return (value ?? config.defaultValue) as FlagValue<C, K>;
  }

  async set<K extends FlagKey<C>>(key: K, value: FlagValue<C, K>): Promise<void> {
    await this.storage.setValue(String(key), value);
  }

  async all(): Promise<FlagValues<C>> {
    const keys = Object.keys(this.config) as FlagKey<C>[];
    const values = await this.storage.getValues(keys.map(String));

    const result = {} as FlagValues<C>;
    for (const key of keys) {
      const config = this.config[key];
      result[key] = values[String(key)] ?? config.defaultValue;
    }
    return result;
  }

  async withTag<G extends Tags<C>, K extends FlagTaggedKey<C, G>>(tag: G): Promise<FlagTaggedValues<C, K>> {
    const taggedConfig = Object.fromEntries(
      Object.entries(this.config).filter(([, config]) => config.tags?.includes(tag)),
    ) as FlagTaggedConfig<C, K>;

    const keys = Object.keys(taggedConfig) as K[];
    const values = await this.storage.getValues(keys.map(String));

    const result = {} as FlagTaggedValues<C, K>;
    for (const key of keys) {
      const config = taggedConfig[key];
      result[key] = values[String(key)] ?? config?.defaultValue;
    }
    return result;
  }

  async resetDefaults() {
    for (const [key, config] of Object.entries(this.config)) {
      await this.storage.setValue(key, config.defaultValue);
    }
  }
}

export function defineFlagsConfig<C extends FlagsConfig>(config: C): C {
  return config;
}
