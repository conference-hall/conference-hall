import { COLORS, generateGradientColor, getContrastColor, getRandomColor } from './colors.ts';

describe('getRandomColor', () => {
  it('returns a color from the predefined colors array', () => {
    const color = getRandomColor();
    expect(COLORS).toContain(color);
  });
});

describe('getContrastColor', () => {
  it('returns black (#000000) for light background colors', () => {
    const lightColor = '#FFFFFF';
    const result = getContrastColor(lightColor);
    expect(result).toBe('#000000');
  });

  it('returns white (#ffffff) for dark background colors', () => {
    const darkColor = '#000000';
    const result = getContrastColor(darkColor);
    expect(result).toBe('#ffffff');
  });

  it('returns correct contrast color based on luminance', () => {
    const color = '#FF5F5F';
    const result = getContrastColor(color);
    expect(result).toBe('#ffffff');
  });
});

describe('generateGradientColor', () => {
  it('returns a linear-gradient string', () => {
    const gradient = generateGradientColor('test');
    expect(gradient).toContain('linear-gradient');
  });

  it('consistently returns the same gradient for the same input', () => {
    const str = 'consistent';
    const gradient1 = generateGradientColor(str);
    const gradient2 = generateGradientColor(str);
    expect(gradient1).toBe(gradient2);
  });

  it('returns different gradients for different inputs', () => {
    const gradient1 = generateGradientColor('string1');
    const gradient2 = generateGradientColor('string2');
    expect(gradient1).not.toBe(gradient2);
  });
});
