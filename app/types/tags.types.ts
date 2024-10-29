import { randAnimal, randHex } from '@ngneat/falso';

export type Tag = { id: string; name: string; color: string };

export const EVENT_TAGS = [
  { id: 'tag-1', name: randAnimal(), color: randHex() },
  { id: 'tag-2', name: randAnimal(), color: randHex() },
  { id: 'tag-3', name: randAnimal(), color: randHex() },
  { id: 'tag-4', name: randAnimal(), color: randHex() },
  { id: 'tag-5', name: randAnimal(), color: randHex() },
  { id: 'tag-6', name: randAnimal(), color: randHex() },
  { id: 'tag-7', name: randAnimal(), color: randHex() },
  { id: 'tag-8', name: randAnimal(), color: randHex() },
  { id: 'tag-9', name: randAnimal(), color: randHex() },
];
