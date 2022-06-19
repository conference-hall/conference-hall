import { randCatchPhrase, randParagraph } from '@ngneat/falso';
import { createEventFormatFactory } from '../../prisma/factories';

export function EventFormatFactory() {
  return createEventFormatFactory({
    name: randCatchPhrase(),
    description: randParagraph(),
  });
}
