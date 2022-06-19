import { randCatchPhrase, randParagraph } from '@ngneat/falso';
import { createEventFormatFactory } from '../../prisma/factories';

export function EventFormatFactory(...traits: any) {
  return createEventFormatFactory({
    name: randCatchPhrase(),
    description: randParagraph(),
  });
}
