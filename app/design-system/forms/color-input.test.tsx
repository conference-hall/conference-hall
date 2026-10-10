import { I18nextProvider } from 'react-i18next';
import { i18nTest } from 'tests/i18n-helpers.ts';
import { page } from 'vitest/browser';
import { ColorInput } from './color-input.tsx';

describe('ColorInput component', () => {
  const onChange = vi.fn();

  beforeEach(() => onChange.mockClear());

  const renderComponent = (props: Partial<React.ComponentProps<typeof ColorInput>> = {}) =>
    page.render(
      <I18nextProvider i18n={i18nTest}>
        <form>
          <ColorInput label="Color" value={null} onChange={onChange} name="color" {...props} />
        </form>
      </I18nextProvider>,
    );

  const trigger = () => page.getByRole('button', { name: /^Color/ });
  const hiddenInput = () => document.querySelector<HTMLInputElement>('input[type="hidden"][name="color"]');

  it('shows the translated name of a preset', async () => {
    await renderComponent({ value: '#FF5F5F' });
    await expect.element(trigger()).toHaveTextContent('Red');
  });

  it('matches a preset case-insensitively', async () => {
    await renderComponent({ value: '#ff5f5f' });
    await expect.element(trigger()).toHaveTextContent('Red');
  });

  it('shows the hex of a color outside the palette', async () => {
    await renderComponent({ value: '#123456' });
    await expect.element(trigger()).toHaveTextContent('#123456');
  });

  it('shows "No color" when empty', async () => {
    await renderComponent({ nullable: true });
    await expect.element(trigger()).toHaveTextContent('No color');
  });

  it('calls onChange with the hex of the picked preset', async () => {
    await renderComponent();
    await trigger().click();
    await page.getByRole('menuitem', { name: 'Blue', exact: true }).click();
    expect(onChange).toHaveBeenCalledWith('#3A7FFF');
  });

  it('offers "No color" only when nullable', async () => {
    await renderComponent({ value: '#FF5F5F' });
    await trigger().click();
    await expect.element(page.getByRole('menuitem', { name: 'Custom color' })).toBeInTheDocument();
    expect(page.getByRole('menuitem', { name: 'No color' }).elements()).toHaveLength(0);
  });

  it('calls onChange with null when "No color" is picked', async () => {
    await renderComponent({ value: '#FF5F5F', nullable: true });
    await trigger().click();
    await page.getByRole('menuitem', { name: 'No color' }).click();
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('commits the custom color on the native change event only', async () => {
    await renderComponent();
    const picker = document.querySelector<HTMLInputElement>('input[type="color"]');
    if (!picker) throw new Error('color picker not found');

    picker.value = '#abcdef';
    picker.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange).not.toHaveBeenCalled();

    picker.dispatchEvent(new Event('change', { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith('#abcdef');
  });

  it('submits the value in a hidden input', async () => {
    await renderComponent({ value: '#FF5F5F' });
    expect(hiddenInput()?.value).toBe('#FF5F5F');
  });

  it('submits nothing when empty', async () => {
    await renderComponent({ value: null, nullable: true });
    expect(hiddenInput()).toBeNull();
  });

  it('hides the label visually when srOnly', async () => {
    await renderComponent({ srOnly: true });
    await expect.element(page.getByText('Color', { exact: true })).toHaveClass('sr-only');
  });
});
