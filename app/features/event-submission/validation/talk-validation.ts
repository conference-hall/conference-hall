import z from 'zod';

const TalkFormSchema = z.object({
  title: z.string().nonempty(),
  abstract: z.string().nonempty(),
  references: z.string().nullable(),
  level: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
});

export function validate(form: FormData) {
  return TalkFormSchema.safeParse({
    title: form.get('title'),
    abstract: form.get('abstract'),
    references: form.get('references'),
    level: form.get('level'),
  });
}
