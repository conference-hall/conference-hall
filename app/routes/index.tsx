import { Container } from '../components/layout/Container';
import { SearchEventForm } from '../features/event-search/components/SearchEventForm';

export default function IndexRoute() {
  return (
    <Container>
      <SearchEventForm />
    </Container>
  );
}
