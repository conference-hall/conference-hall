import { setupDatabase } from 'tests/db-helpers';
import { db } from '../db';

describe('test jest', () => {
  setupDatabase();

  it('should pass 1', async () => {
    const result = await db.event.count();
    expect(result).toBe(0);
  });

  it('should pass 2', async () => {
    const result = await db.event.count();
    expect(result).toBe(0);
  });
});
