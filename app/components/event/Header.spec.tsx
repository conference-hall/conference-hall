/**
 * @jest-environment jsdom
 */
import React from 'react'
import { render } from '../../../tests/react-helpers';
import { Header } from './Header';

describe('Header component', () => {
  it('renders name, address and dates', () => {
    const { getByText } = render(
      <Header
        name="Devfest Nantes"
        address="Nantes, France"
        conferenceStart="2020-11-20T00:00:00.000Z"
        conferenceEnd="2020-11-21T00:00:00.000Z"
      />
    );

    expect(getByText('Devfest Nantes')).toBeVisible();
  });
});
