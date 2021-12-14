import { buildUser } from '../../tests/factories/users';

export default async () => {
  await buildUser({
    id: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb',
    name: 'Peter Paker',
    email: 'spiderman@example.com',
    photoURL: 'https://www.mdcu-comics.fr/uploads/news/2020/09/news_illustre_1600620975_30.jpg',
  });
};
