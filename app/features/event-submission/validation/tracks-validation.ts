import z from 'zod';

const TracksSchema = z.object({
  formats: z.array(z.string()),
  categories: z.array(z.string()),
});

type Options = { isFormatsRequired: boolean; isCategoriesRequired: boolean };

export function validate(form: FormData, { isFormatsRequired, isCategoriesRequired }: Options) {
  const schema = TracksSchema.refine((data) => (isFormatsRequired ? Boolean(data.formats?.length) : true), {
    message: 'Formats are required',
    path: ['formats'],
  }).refine((data) => (isCategoriesRequired ? Boolean(data.categories?.length) : true), {
    message: 'Categories are required',
    path: ['categories'],
  });

  return schema.safeParse({
    formats: form.getAll('formats'),
    categories: form.getAll('categories'),
  });
}
