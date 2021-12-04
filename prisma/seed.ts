import seedUsers from './seeds/users';
import seedEvents from './seeds/events';

async function seed() {
  await seedUsers();
  await seedEvents();
}

seed();
