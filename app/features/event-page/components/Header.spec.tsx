import React from 'react'
import { render } from '../../../../tests/react-helpers';
import { Header } from './Header';

describe('Header component', () => {
  it('renders name, address and dates', () => {
    const { getByText } = render(
      <Header
        slug="devfest-nantes"
        name="Devfest Nantes"
        type="CONFERENCE"
        address="Nantes, France"
        conferenceStart="2020-11-20T00:00:00.000Z"
        conferenceEnd="2020-11-21T00:00:00.000Z"
        cfpState="OPENED"
        surveyEnabled={true}
      />
    );

    expect(getByText('Devfest Nantes')).toBeVisible();
  });
});
