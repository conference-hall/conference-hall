import z from 'zod';

const SurveyFormSchema = z.object({
  gender: z.string().nullable(),
  tshirt: z.string().nullable(),
  accomodation: z.string().nullable(),
  transports: z.array(z.string()).nullable(),
  diet: z.array(z.string()).nullable(),
  info: z.string().nullable(),
});

export function validate(form: FormData) {
  return SurveyFormSchema.safeParse({
    gender: form.get('gender'),
    tshirt: form.get('tshirt'),
    accomodation: form.get('accomodation'),
    transports: form.getAll('transports'),
    diet: form.getAll('diet'),
    info: form.get('info'),
  });
}
