type ImagePlaceholderOptions = {
  width: number;
  height: number;
  backgroundColor?: string;
  shapeColor?: string;
};

/**
 * Generates a placeholder image as SVG and converts to base64
 * @param options Configuration options for the placeholder
 * @returns Base64 encoded SVG image string with data URL prefix
 */
export function generateImagePlaceholder(options: ImagePlaceholderOptions): string {
  const { width, height, backgroundColor = '#cccccc', shapeColor = '#FFFFFF' } = options;

  const shapeElement = generateShape(width, height, shapeColor);

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="${backgroundColor}"/>
      ${shapeElement}
    </svg>
  `.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

type ShapeType = 'circle' | 'square' | 'triangle' | 'cross' | 'diamond';

/** Generates a random shape SVG element */
function generateShape(width: number, height: number, color: string): string {
  const shapes: ShapeType[] = ['circle', 'square', 'triangle', 'cross', 'diamond'];
  const randomShape = shapes[Math.floor(Math.random() * shapes.length)];

  const centerX = width / 2;
  const centerY = height / 2;
  const size = Math.min(width, height) / 4.5;

  switch (randomShape) {
    case 'circle':
      return `<circle cx="${centerX}" cy="${centerY}" r="${size}" fill="${color}" opacity="0.5"/>`;

    case 'square':
      return `<rect x="${centerX - size}" y="${centerY - size}" width="${size * 2}" height="${size * 2}" fill="${color}" opacity="0.5"/>`;

    case 'triangle': {
      const trianglePoints = [
        [centerX, centerY - size],
        [centerX - size, centerY + size],
        [centerX + size, centerY + size],
      ]
        .map((p) => p.join(','))
        .join(' ');
      return `<polygon points="${trianglePoints}" fill="${color}" opacity="0.5"/>`;
    }

    case 'cross': {
      const crossWidth = size / 3;
      return `
        <rect x="${centerX - crossWidth}" y="${centerY - size}" width="${crossWidth * 2}" height="${size * 2}" fill="${color}" opacity="0.5"/>
        <rect x="${centerX - size}" y="${centerY - crossWidth}" width="${size * 2}" height="${crossWidth * 2}" fill="${color}" opacity="0.5"/>
      `;
    }

    case 'diamond': {
      const diamondPoints = [
        [centerX, centerY - size],
        [centerX + size, centerY],
        [centerX, centerY + size],
        [centerX - size, centerY],
      ]
        .map((p) => p.join(','))
        .join(' ');
      return `<polygon points="${diamondPoints}" fill="${color}" opacity="0.5"/>`;
    }
  }
}
