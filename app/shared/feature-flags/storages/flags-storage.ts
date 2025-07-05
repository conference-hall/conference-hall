import type { FlagConfig } from '../types.ts';

export interface FlagsStorage {
  getValue(key: string): Promise<any>;

  getValues(keys: string[]): Promise<Record<string, any>>;

  getAllValues(): Promise<Record<string, any>>;

  setValue(key: string, value: any, config: FlagConfig): Promise<void>;

  deleteValue(key: string): Promise<void>;
}
