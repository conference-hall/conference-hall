import { randCatchPhrase, randParagraph } from '@ngneat/falso';
import { createEventCategoryFactory } from '../../prisma/factories';

export function EventCategoryFactory() {
  return createEventCategoryFactory({ 
    name: randCatchPhrase(),
    description: randParagraph(),
  });
}