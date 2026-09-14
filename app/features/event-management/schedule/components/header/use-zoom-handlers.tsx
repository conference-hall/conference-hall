import { useMemo, useState } from 'react';

const ZOOM_LEVEL_DEFAULT = 1;
const ZOOM_LEVEL_MIN = 0;
const ZOOM_LEVEL_MAX = 4;

export type ZoomHandlers = {
  level: number;
  zoomIn: VoidFunction;
  zoomOut: VoidFunction;
  canZoomIn: boolean;
  canZoomOut: boolean;
};

// The handlers keep their identity as long as the zoom level does not change, so the memoized header renders on a
// zoom and on nothing else.
export function useZoomHandlers(initialZoom = ZOOM_LEVEL_DEFAULT) {
  const [level, setLevel] = useState(initialZoom);

  return useMemo<ZoomHandlers>(
    () => ({
      level,
      zoomIn: () => setLevel((z) => Math.min(z + 1, ZOOM_LEVEL_MAX)),
      zoomOut: () => setLevel((z) => Math.max(z - 1, ZOOM_LEVEL_MIN)),
      canZoomIn: level < ZOOM_LEVEL_MAX,
      canZoomOut: level > ZOOM_LEVEL_MIN,
    }),
    [level],
  );
}
