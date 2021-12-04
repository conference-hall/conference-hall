import { Form } from 'remix';
import { Button } from '../components/ui/Buttons';
import { Container } from '../components/ui/Container';
import { SearchEventForm } from '../components/search/SearchEventForm';

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
