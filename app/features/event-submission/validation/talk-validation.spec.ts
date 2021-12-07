/**
 * @jest-environment jsdom
 */
import { validate } from './talk-validation';

describe('Talk form data validation', () => {
  it('should validate the talk form', async () => {
    const form = new FormData();
    form.append('title', 'Title Talk');
    form.append('abstract', 'Abstract Talk');
    form.append('references', 'References Talk');
    form.append('level', 'BEGINNER');

    const result = validate(form);

    expect(result.success).toBe(true);
    expect(result.success && result.data).toEqual({
      title: 'Title Talk',
      abstract: 'Abstract Talk',
      references: 'References Talk',
      level: 'BEGINNER',
    });
  });

  it('should not validate empty mandatory fields', async () => {
    const form = new FormData();
    form.append('title', '');
    form.append('abstract', '');

    const result = validate(form);

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = Object.keys(result.error.flatten().fieldErrors);
      expect(errors).toEqual(['title', 'abstract']);
    }
  });

  it('should not validate incorrect level', async () => {
    const form = new FormData();
    form.append('title', 'Title Talk');
    form.append('abstract', 'Abstract Talk');
    form.append('level', 'INVALID');

    const result = validate(form);

    expect(result.success).toBe(false);

    if (!result.success) {
      const errors = Object.keys(result.error.flatten().fieldErrors);
      expect(errors).toEqual(['level']);
    }
  });
});
