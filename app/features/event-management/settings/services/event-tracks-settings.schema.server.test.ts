import { CategorySaveSchema, FormatSaveSchema, TrackReorderSchema } from './event-tracks-settings.schema.server.ts';

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

describe('#TrackReorderSchema', () => {
  it('parses the target index', () => {
    const result = TrackReorderSchema.safeParse({ id: 'track-1', targetIndex: '2' });

    expect(result.data).toEqual({ id: 'track-1', targetIndex: 2 });
  });

  it('rejects a negative target index', () => {
    expect(TrackReorderSchema.safeParse({ id: 'track-1', targetIndex: '-1' }).success).toBe(false);
  });

  it('rejects a missing target index', () => {
    expect(TrackReorderSchema.safeParse({ id: 'track-1' }).success).toBe(false);
  });
});
