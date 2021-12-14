import { buildUser } from '../../tests/factories/users';

export default async () => {
  await buildUser({ id: 'tpSmd3FehZIM3Wp4HYSBnfnQmXLb', name: 'Peter Paker', email: 'spiderman@example.com' });
  await buildUser({ id: 'xP1e9XSNLK0pJSlsQ4pC63L2U3Jt', name: 'Harley Quinn', email: 'harley.quinn@example.com' });
  await buildUser({ id: '9licQdPND0UtBhShJ7vveJ703sJs', name: 'Clark Kent', email: 'superman@example.com' });
  await buildUser({ id: 'xXklEkfEV3rQ01kHRh5pLO7IkX1v', name: 'Matthew Murdock', email: 'daredevil@example.com' });
  await buildUser({ id: 'e9HDr773xNpXbOy2H0C7FDhGD2fc', name: 'Bruce Wayne', email: 'batman@example.com' });
};
