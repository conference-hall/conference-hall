import { useState } from 'react';

const ZOOM_LEVEL_DEFAULT = 0;
const ZOOM_LEVEL_MIN = 0;
const ZOOM_LEVEL_MAX = 3;

export type ZoomHandlers = {
  level: number;
  zoomIn: VoidFunction;
  zoomOut: VoidFunction;
  canZoomIn: boolean;
  canZoomOut: boolean;
};

export function useZoomHandlers(initialZoom = ZOOM_LEVEL_DEFAULT) {
  const [level, setLevel] = useState(initialZoom);

  const zoomIn = () => setLevel((z) => Math.min(z + 1, ZOOM_LEVEL_MAX));

  const zoomOut = () => setLevel((z) => Math.max(z - 1, ZOOM_LEVEL_MIN));

  const canZoomIn = level < ZOOM_LEVEL_MAX;

  const canZoomOut = level > ZOOM_LEVEL_MIN;

  return { level, zoomIn, zoomOut, canZoomIn, canZoomOut };
}
