import { Form } from 'remix';
import { Button } from '../components/Buttons';
import { Container } from '../components/layout/Container';
import { SearchEventForm } from '../features/event-search/components/SearchEventForm';

export default function IndexRoute() {
  return (
    <Container>
      <SearchEventForm />
      <Form action="/logout" method="post">
        <Button variant="secondary" type="submit">Logout</Button>
      </Form>
    </Container>
  );
}
