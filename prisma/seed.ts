import { seedFromFile } from '../tests/db-helpers';

const files = [
  `${__dirname}/fixtures/users.json`,
  `${__dirname}/fixtures/events.json`,
]

async function seed() {
  for (const file of files) {
    await seedFromFile(file);
  }
}

seed();
