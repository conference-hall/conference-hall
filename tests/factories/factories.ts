import { EventCategoryFactory } from './categories';
import { EventFactory } from './events';
import { EventFormatFactory } from './formats';
import { UserFactory } from './users';

export function applyTraits<T extends Record<string, unknown>, S extends string[]>(TRAITS: T, traits: S) {
  return traits?.reduce((attributes, trait) => {
    const selected = TRAITS?.[trait];
    if (selected) {
      return Object.assign(attributes, selected);
    }
    return attributes;
  }, {});
}

const Factories = {
  'EventCategoryFactory': EventCategoryFactory,
  'EventFactory': EventFactory,
  'EventFormatFactory': EventFormatFactory,
  'UserFactory': UserFactory,
}

type FactoryTask = {
  name: keyof typeof Factories;
  traits?: any;
  attrs?: any;
};

export async function execFactoryTask(commands: FactoryTask[]) {
  const execFactory = async (command: FactoryTask) => {
    const Factory = Factories[command.name];
    if (!Factory) {
      throw new Error(`Could not find factory for "${command.name}"`);
    }
    return Factory(command.traits).create(command.attrs);
  };
  return Promise.all(commands.map(execFactory));
}