type ImagePlaceholderOptions = {
  width: number;
  height: number;
  backgroundColor?: string;
  textColor?: string;
  text?: string;
};

/**
 * Generates a placeholder image as SVG and converts to base64
 * @param options Configuration options for the placeholder
 * @returns Base64 encoded SVG image string with data URL prefix
 */
export function generateImagePlaceholder(options: ImagePlaceholderOptions): string {
  const { width, height, backgroundColor = '#cccccc', textColor = '#666666', text = `${width}x${height}` } = options;

  // Calculate font size based on dimensions
  const fontSize = Math.min(width, height) / 5;

  // Escape text
  const safeText = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  // Create SVG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif" 
        font-size="${fontSize}" 
        fill="${textColor}" 
        text-anchor="middle" 
        dominant-baseline="middle"
      >${safeText}</text>
    </svg>
  `.trim();

  // Convert to base64
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}
