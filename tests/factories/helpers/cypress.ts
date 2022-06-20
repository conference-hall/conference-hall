import { EventCategoryFactory } from '../categories';
import { EventFactory } from '../events';
import { EventFormatFactory } from '../formats';
import { UserFactory } from '../users';

const Factories = {
  'EventCategoryFactory': EventCategoryFactory,
  'EventFactory': EventFactory,
  'EventFormatFactory': EventFormatFactory,
  'UserFactory': UserFactory,
}

type FactoryTask = { name: keyof typeof Factories } & Record<string, any>;

export async function execFactoryTask(commands: FactoryTask[]) {
  const execFactory = async (command: FactoryTask) => {
    const Factory = Factories[command.name];
    if (!Factory) {
      throw new Error(`Could not find factory for "${command.name}"`);
    }
    return Factory.create(command as any);
  };
  return Promise.all(commands.map(execFactory));
}