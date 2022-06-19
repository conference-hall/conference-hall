import { randCatchPhrase, randParagraph } from '@ngneat/falso';
import { createEventCategoryFactory } from '../../prisma/factories';

export function EventCategoryFactory(...traits: any) {
  return createEventCategoryFactory({ 
    name: randCatchPhrase(),
    description: randParagraph(),
  });
}