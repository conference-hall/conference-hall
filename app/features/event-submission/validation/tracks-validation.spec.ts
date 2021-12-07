/**
 * @jest-environment jsdom
 */
import { validate } from './tracks-validation';

describe('Tracks form data validation', () => {
  it('should validate all tracks', async () => {
    const form = new FormData();
    form.append('formats', 'Conference');
    form.append('formats', 'Quickies');
    form.append('categories', 'Web');
    form.append('categories', 'Mobile');

    const result = validate(form, { isFormatsRequired: false, isCategoriesRequired: false });

    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({
      formats: ['Conference', 'Quickies'],
      categories: ['Web', 'Mobile'],
    });
  });

  it('should not validate empty formats when required', async () => {
    const form = new FormData();
    form.append('categories', 'Web');

    const result = validate(form, { isFormatsRequired: true, isCategoriesRequired: false });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = Object.keys(result.error.flatten().fieldErrors);
      expect(errors).toEqual(['formats']);
    }
  });

  it('should not validate empty categories when required', async () => {
    const form = new FormData();
    form.append('formats', 'Quickies');

    const result = validate(form, { isFormatsRequired: false, isCategoriesRequired: true });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = Object.keys(result.error.flatten().fieldErrors);
      expect(errors).toEqual(['categories']);
    }
  });
});
