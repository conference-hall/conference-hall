import { SurveySchema } from './survey';
import { parse } from '@conform-to/zod';

describe('Validate SurveySchema', () => {
  it('validates survey form inputs', async () => {
    const form = new FormData();
    form.append('gender', 'male');
    form.append('tshirt', 'XL');
    form.append('accomodation', 'true');
    form.append('transports', 'taxi');
    form.append('transports', 'train');
    form.append('diet', 'vegan');
    form.append('diet', 'vegetarian');
    form.append('info', 'Hello');

    const result = parse(form, { schema: SurveySchema });
    expect(result.value).toEqual({
      gender: 'male',
      tshirt: 'XL',
      accomodation: 'true',
      transports: ['taxi', 'train'],
      diet: ['vegan', 'vegetarian'],
      info: 'Hello',
    });
  });

  it('reset survey form inputs', async () => {
    const form = new FormData();
    form.append('gender', '');
    form.append('tshirt', '');
    form.append('accomodation', '');
    form.append('info', '');

    const result = parse(form, { schema: SurveySchema });
    expect(result.value).toEqual({
      gender: null,
      tshirt: null,
      accomodation: null,
      info: null,
    });
  });
});
