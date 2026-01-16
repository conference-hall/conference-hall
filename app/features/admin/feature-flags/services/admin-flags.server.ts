import type { AuthorizedAdmin } from '~/shared/authorization/types.ts';
import type { FlagConfig } from '~/shared/feature-flags/types.ts';
import { NotAuthorizedError, NotFoundError } from '~/shared/errors.server.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';

export class AdminFlags {
  private constructor() {}

  static for(authorizedAdmin: AuthorizedAdmin) {
    if (!authorizedAdmin) throw new NotAuthorizedError();
    return new AdminFlags();
  }

  async list() {
    const flagsConfig = flags.getConfig();
    const values = await flags.all();

    return Object.entries(values).map(([key, value]) => {
      const config = flagsConfig[key as keyof typeof flagsConfig] as FlagConfig | undefined;
      return {
        key,
        description: config?.description,
        type: config?.type,
        tags: config?.tags ?? [],
        value,
      };
    });
  }

  async update(key: string, value: string) {
    const flagsConfig = flags.getConfig();
    const flagKey = key as keyof typeof flagsConfig;
    const config = flagsConfig[flagKey];

    if (!config) throw new NotFoundError(`Flag "${key}" not found`);

    const flagType = config.type as string;

    let flagValue: any = null;
    if (flagType === 'number') {
      flagValue = Number(value);
    } else if (flagType === 'boolean') {
      flagValue = String(value) === 'true';
    } else {
      flagValue = String(value);
    }

    await flags.set(flagKey, flagValue);
  }
}
