import { withZod } from '@remix-validated-form/with-zod';
import { SurveySchema } from './survey';

describe('Validate SurveySchema', () => {
  it('validates survey form inputs', async () => {
    const formData = new FormData();
    formData.append('gender', 'male');
    formData.append('tshirt', 'XL');
    formData.append('accomodation', 'true');
    formData.append('transports', 'taxi');
    formData.append('transports', 'train');
    formData.append('diet', 'vegan');
    formData.append('diet', 'vegetarian');
    formData.append('info', 'Hello');

    const result = await withZod(SurveySchema).validate(formData);
    expect(result.data).toEqual({
      gender: 'male',
      tshirt: 'XL',
      accomodation: 'true',
      transports: ['taxi', 'train'],
      diet: ['vegan', 'vegetarian'],
      info: 'Hello',
    });
  });

  it('reset survey form inputs', async () => {
    const formData = new FormData();
    formData.append('gender', '');
    formData.append('tshirt', '');
    formData.append('accomodation', '');
    formData.append('info', '');

    const result = await withZod(SurveySchema).validate(formData);
    expect(result.data).toEqual({
      gender: null,
      tshirt: null,
      accomodation: null,
      info: null,
    });
  });
});
