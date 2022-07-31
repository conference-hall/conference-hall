import { getArray } from './form';

describe('#getArray', () => {
  it('transform array form data syntax to array', () => {
    const form = new FormData();
    form.append('languages[0]', 'fr');
    form.append('languages[1]', 'en');

    const result = getArray(form, 'languages');

    expect(result).toEqual(['fr', 'en']);
  });

  it('returns an empty array if it is not a array form syntax', () => {
    const form = new FormData();
    form.append('languages', 'fr');

    const result = getArray(form, 'languages');

    expect(result).toEqual([]);
  });

  it('returns an empty array if key not found', () => {
    const form = new FormData();
    form.append('languages[0]', 'fr');

    const result = getArray(form, 'other');

    expect(result).toEqual([]);
  });
});
