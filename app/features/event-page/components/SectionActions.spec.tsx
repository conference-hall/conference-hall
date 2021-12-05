import React from 'react'
import { render } from 'tests/react-helpers';
import { SectionActions } from './SectionActions';

describe('Section action component', () => {
  it('renders all section fields', () => {
    const { getByRole } = render(
      <SectionActions
        bannerUrl="https://github.com/bpetetot.png"
        websiteUrl="https://devfest.gdgnantes.com"
        contactEmail="https://devfest.gdgnantes.com"
        codeOfConductUrl="https://devfest.gdgnantes.com/cod.html"
        cfpState="OPENED"
      />
    );

    expect(getByRole('link', {name: 'https://devfest.gdgnantes.com'})).toBeVisible();
    expect(getByRole('link', {name: 'Code of conduct'})).toBeVisible();
    expect(getByRole('link', {name: 'Contacts'})).toBeVisible();
    expect(getByRole('link', {name: 'Submit a talk'})).toBeVisible();
  });

  it('does not render all section fields', () => {
    const { queryByRole } = render(
      <SectionActions
        bannerUrl="https://github.com/bpetetot.png"
        websiteUrl={null}
        contactEmail={null}
        codeOfConductUrl={null}
        cfpState="CLOSED"
      />
    );

    expect(queryByRole('link', {name: 'https://devfest.gdgnantes.com'})).toBe(null);
    expect(queryByRole('link', {name: 'Code of conduct'})).toBe(null);
    expect(queryByRole('link', {name: 'Contacts'})).toBe(null);
    expect(queryByRole('link', {name: 'Submit a talk'})).toBe(null);
  });
});
