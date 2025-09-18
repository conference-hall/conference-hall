import type express from 'express';
import { getSharedServerEnv } from 'servers/environment.server.ts';

const { NODE_ENV } = getSharedServerEnv();

export function applyPlaceholderImages(app: express.Application) {
  if (NODE_ENV === 'production') return;

  app.use('/placeholder-images', async (req, res) => {
    const targetUrl = `https://picsum.photos${req.path}`;

    const response = await fetch(targetUrl);
    if (!response.ok) {
      return res.status(response.status).send('Error fetching image');
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    const contentType = response.headers.get('content-type') ?? 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // 1h browser cache
    res.send(buffer);
  });
}
