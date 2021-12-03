import { seedFromFile } from '../tests/db-helpers';

const files = [
  `${__dirname}/seeds/users.json`,
  `${__dirname}/seeds/events.json`,
]

async function seed() {
  for (const file of files) {
    await seedFromFile(file);
  }
}

seed();
