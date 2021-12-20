import React from 'react'
import { render } from 'tests/react-helpers';
import { SectionInfo } from './SectionInfo';

describe('Section information component', () => {
  it('renders all section fields', () => {
    const { getByText } = render(
      <SectionInfo
        description="Event description"
        formats={[{ id: "f1", name:"format 1", description: 'desc format 1'}]}
        categories={[{ id: "f1", name:"cat 1", description: 'desc cat 1'}]}
      />
    );

    expect(getByText("Event description")).toBeVisible();
    expect(getByText("Call for paper is open")).toBeVisible();
    expect(getByText("format 1")).toBeVisible();
    expect(getByText("cat 1")).toBeVisible();
  });

  it('doesnt renders formats and categories if empty', () => {
    const { queryByText } = render(
      <SectionInfo
        description="Event description"
        formats={[]}
        categories={[]}
      />
    );

    expect(queryByText("Formats")).toBe(null);
    expect(queryByText("Categories")).toBe(null);
  });
});
