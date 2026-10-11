import { CategorySaveSchema, FormatSaveSchema } from './event-tracks-settings.schema.server.ts';

describe.each([
  ['CategorySaveSchema', CategorySaveSchema],
  ['FormatSaveSchema', FormatSaveSchema],
])('#%s', (_, schema) => {
  const track = { name: 'Name', description: 'Description' };

  it('accepts a hex color', () => {
    const result = schema.safeParse({ ...track, color: '#ff5f5f' });

    expect(result.success && result.data.color).toBe('#ff5f5f');
  });

  it('rejects a missing color', () => {
    expect(schema.safeParse(track).success).toBe(false);
  });

  it('rejects an invalid color', () => {
    expect(schema.safeParse({ ...track, color: 'red' }).success).toBe(false);
  });
});
