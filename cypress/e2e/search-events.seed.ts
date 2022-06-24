import { eventFactory } from '../../tests/factories/events'

export const seed = async () => {
  await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes', address: 'Nantes, France' },
    traits: ['conference-cfp-open'],
  })
  await eventFactory({
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes', address: 'Nantes, France' },
    traits: ['meetup-cfp-open'],
  })
}