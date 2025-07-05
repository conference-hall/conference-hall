import type { FlagConfig } from '../types.ts';
import type { FlagsStorage } from './flags-storage.ts';

export class MemoryStorage implements FlagsStorage {
  private storage: Map<string, any> = new Map();

  async getValue(key: string): Promise<any> {
    return this.storage.get(key);
  }

  async getValues(keys: string[]): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    for (const key of keys) {
      result[key] = this.storage.get(key);
    }
    return result;
  }

  async getAllValues(): Promise<Record<string, any>> {
    return Object.fromEntries(this.storage);
  }

  async setValue(key: string, value: any, _config: FlagConfig) {
    this.storage.set(key, value);
  }

  async deleteValue(key: string) {
    this.storage.delete(key);
  }
}
