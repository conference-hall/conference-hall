// All types for flags confdiguration
export type FlagsConfig = Record<string, FlagConfig>;

export type FlagConfig =
  | {
      description: string;
      type: 'boolean';
      defaultValue: boolean;
      tags?: readonly string[];
    }
  | {
      description: string;
      type: 'number';
      defaultValue: number;
      tags?: readonly string[];
    }
  | {
      description: string;
      type: 'string';
      defaultValue: string;
      tags?: readonly string[];
    };

type TypeMapping = { boolean: boolean; number: number; string: string };

// All types for basic flags
export type FlagKey<C extends FlagsConfig> = keyof C;

export type FlagValue<C extends FlagsConfig, K extends FlagKey<C>> = TypeMapping[C[K]['type']];

export type FlagValues<C extends FlagsConfig> = { [K in FlagKey<C>]: TypeMapping[C[K]['type']] };

// All types for tagged flags
type ExtractTags<C> = C extends { tags?: readonly (infer U)[] } ? U : never;
export type Tags<C extends FlagsConfig> = ExtractTags<C[keyof C]>;

type FlagWithTag<C, T> = C extends { tags?: readonly (infer U)[] } ? (T extends U ? C : never) : never;

export type FlagTaggedKey<C extends FlagsConfig, T> = {
  [K in keyof C]: FlagWithTag<C[K], T> extends never ? never : K;
}[keyof C];

export type FlagTaggedConfig<C extends FlagsConfig, Key extends FlagTaggedKey<C, Tags<C>>> = {
  [K in Key]: C[K];
};

export type FlagTaggedValues<C extends FlagsConfig, Key extends FlagTaggedKey<C, Tags<C>>> = {
  [K in Key]: TypeMapping[C[K]['type']];
};
