import { PageObject } from 'e2e/page-object.ts';

export class EventPage extends PageObject {
  async goto(slug: string, name: string) {
    await this.page.goto(`/${slug}`);
    await this.waitFor(name);
  }

  async waitFor(name: string) {
    await this.heading(name).waitFor();
  }

  heading(name: string) {
    return this.page.getByRole('heading', { name });
  }
}
