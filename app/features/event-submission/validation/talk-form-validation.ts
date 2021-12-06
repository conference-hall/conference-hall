import z from 'zod';

const TalkFormSchema = z.object({
  title: z.string().nonempty(),
  abstract: z.string().nonempty(),
  references: z.string().nullable(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
  formats: z.array(z.string()),
  categories: z.array(z.string()),
});

type Options = { isFormatsRequired: boolean; isCategoriesRequired: boolean };

export function getTalkData(form: FormData, { isFormatsRequired, isCategoriesRequired }: Options) {
  const schema = TalkFormSchema.refine((data) => (isFormatsRequired ? Boolean(data.formats?.length) : true), {
    message: 'Formats are required',
    path: ['formats'],
  }).refine((data) => (isCategoriesRequired ? Boolean(data.categories?.length) : true), {
    message: 'Categories are required',
    path: ['categories'],
  });

  return schema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
    formats: form.getAll('formats'),
    categories: form.getAll('categories'),
  });
}
