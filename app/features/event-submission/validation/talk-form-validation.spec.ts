/**
 * @jest-environment jsdom
 */
import { getTalkData } from './talk-form-validation';

describe('Talk form data validation', () => {
  it('should validate the talk form', async () => {
    const form = new FormData();
    form.append('title', 'Title Talk');
    form.append('abstract', 'Abstract Talk');
    form.append('references', 'References Talk');
    form.append('formats', 'Conference');
    form.append('formats', 'Quickies');
    form.append('categories', 'Web');
    form.append('categories', 'Mobile');

    const result = getTalkData(form, { isFormatsRequired: false, isCategoriesRequired: false });

    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({
      title: 'Title Talk',
      abstract: 'Abstract Talk',
      references: 'References Talk',
      formats: ['Conference', 'Quickies'],
      categories: ['Web', 'Mobile'],
    });
  });

  it('should not validate empty mandatory fields', async () => {
    const form = new FormData();
    form.append('title', '');
    form.append('abstract', '');
    form.append('references', '');

    const result = getTalkData(form, { isFormatsRequired: false, isCategoriesRequired: false });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = Object.keys(result.error.flatten().fieldErrors);
      expect(errors).toEqual(['title', 'abstract']);
    }
  });

  it('should not validate empty formats or categories when required', async () => {
    const form = new FormData();
    form.append('title', 'Title');
    form.append('abstract', 'Abstract');
    form.append('references', 'Reference');

    const result = getTalkData(form, { isFormatsRequired: true, isCategoriesRequired: true });

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = Object.keys(result.error.flatten().fieldErrors);
      expect(errors).toEqual(['formats', 'categories']);
    }
  });
});
