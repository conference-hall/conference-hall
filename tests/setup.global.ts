import { x } from 'tinyexec';

export async function setup() {
  // Run the migrations before the tests
  const proc = x('prisma', ['db', 'push', '--accept-data-loss']);
  for await (const line of proc) {
    console.log(line);
  }
  if (proc.exitCode !== 0) {
    throw new Error('Failed to run Prisma migrations');
  }
}
