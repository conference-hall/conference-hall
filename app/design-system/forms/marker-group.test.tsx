import { HeartIcon, NoSymbolIcon, StarIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { page } from 'vitest/browser';
import type { MarkerOption } from './marker-group.tsx';
import { MarkerGroup } from './marker-group.tsx';

const options: MarkerOption[] = [
  { value: 'no-opinion', icon: NoSymbolIcon, fill: 'fill-red-100', label: 'No opinion' },
  { value: 'negative', icon: XCircleIcon, fill: 'fill-gray-300', label: 'Negative' },
  { value: 'neutral-1', icon: StarIcon, fill: 'fill-yellow-400', label: 'Star 1', cumulative: true },
  { value: 'neutral-2', icon: StarIcon, fill: 'fill-yellow-400', label: 'Star 2', cumulative: true },
  { value: 'neutral-3', icon: StarIcon, fill: 'fill-yellow-400', label: 'Star 3', cumulative: true },
  { value: 'positive', icon: HeartIcon, fill: 'fill-red-400', label: 'Positive' },
];

function MarkerGroupWrapper(props: { initialValue?: string | null }) {
  const [value, setValue] = useState<string | null>(props.initialValue ?? null);
  return <MarkerGroup options={options} value={value} onChange={setValue} />;
}

describe('MarkerGroup component', () => {
  it('renders all marker buttons', async () => {
    await page.render(<MarkerGroupWrapper />);

    for (const option of options) {
      await expect.element(page.getByRole('button', { name: option.label })).toBeInTheDocument();
    }
  });

  it('selects a marker on click', async () => {
    await page.render(<MarkerGroupWrapper />);

    await page.getByRole('button', { name: 'Negative' }).click();
    const negativeButton = page.getByRole('button', { name: 'Negative' });
    await expect.element(negativeButton).toHaveClass(/bg-indigo-100/);
  });

  it('deselects a marker when clicking same value', async () => {
    await page.render(<MarkerGroupWrapper initialValue="negative" />);

    const negativeButton = page.getByRole('button', { name: 'Negative' });
    await expect.element(negativeButton).toHaveClass(/bg-indigo-100/);

    await negativeButton.click();
    await expect.element(negativeButton).not.toHaveClass(/bg-indigo-100/);
  });

  it('activates cumulative markers up to selected index', async () => {
    await page.render(<MarkerGroupWrapper />);

    await page.getByRole('button', { name: 'Star 2' }).click();

    await expect.element(page.getByRole('button', { name: 'Star 1' })).toHaveClass(/bg-indigo-100/);
    await expect.element(page.getByRole('button', { name: 'Star 2' })).toHaveClass(/bg-indigo-100/);
    await expect.element(page.getByRole('button', { name: 'Star 3' })).not.toHaveClass(/bg-indigo-100/);
  });

  it('activates all cumulative markers when positive is selected', async () => {
    await page.render(<MarkerGroupWrapper initialValue="positive" />);

    await expect.element(page.getByRole('button', { name: 'Star 1' })).toHaveClass(/bg-indigo-100/);
    await expect.element(page.getByRole('button', { name: 'Star 2' })).toHaveClass(/bg-indigo-100/);
    await expect.element(page.getByRole('button', { name: 'Star 3' })).toHaveClass(/bg-indigo-100/);
    await expect.element(page.getByRole('button', { name: 'Positive' })).toHaveClass(/bg-indigo-100/);
  });

  it('renders hidden input with name and value', async () => {
    await page.render(<MarkerGroup name="review" options={options} value="neutral-1" onChange={() => {}} />);

    const container = page.getByRole('button', { name: 'No opinion' }).element().parentElement!;
    const input = container.querySelector('input[name="review"]') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('neutral-1');
  });

  it('renders empty value in hidden input when nothing selected', async () => {
    await page.render(<MarkerGroup name="review" options={options} value={null} onChange={() => {}} />);

    const container = page.getByRole('button', { name: 'No opinion' }).element().parentElement!;
    const input = container.querySelector('input[name="review"]') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
