import { type CollisionDetector, CollisionPriority, CollisionType } from '@dnd-kit/abstract';
import { Point, Rectangle } from '@dnd-kit/geometry';
import { countIntervalsInTimeSlot } from '~/libs/datetimes/timeslots.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import { SESSIONS_GAP_PX, TIMESLOT_HEIGHTS } from './config.ts';

// Get a single timeslot height
export function getTimeslotHeight(zoomLevel: number) {
  if (zoomLevel >= 0 && zoomLevel < TIMESLOT_HEIGHTS.length) {
    return TIMESLOT_HEIGHTS[zoomLevel];
  }
  return TIMESLOT_HEIGHTS[0];
}

// Get the height of a session based on its timeslot and the zoom level
export function getSessionHeight(session: ScheduleSession, interval: number, zoomLevel: number) {
  const intervalsCount = countIntervalsInTimeSlot(session.timeslot, interval);
  return getTimeslotHeight(zoomLevel) * intervalsCount - SESSIONS_GAP_PX;
}

// Collision detector to check if the top center of a draggable shape is inside a droppable area
export const topInsideDroppable: CollisionDetector = (input) => {
  const { dragOperation, droppable } = input;
  const { shape } = dragOperation;

  if (!droppable.shape || !shape) return null;

  const draggableRect = Rectangle.from(shape.current.boundingRectangle);
  const droppableRect = Rectangle.from(droppable.shape.boundingRectangle);

  const topCenter = {
    x: (draggableRect.left + draggableRect.right) / 2,
    y: draggableRect.top,
  };

  const isTopInside =
    topCenter.x >= droppableRect.left &&
    topCenter.x <= droppableRect.right &&
    topCenter.y >= droppableRect.top &&
    topCenter.y <= droppableRect.bottom;

  const distanceToTop = Point.distance(topCenter, {
    x: (droppableRect.left + droppableRect.right) / 2,
    y: droppableRect.top,
  });

  const value = isTopInside ? 1 : 1 / distanceToTop;

  return { id: droppable.id, value, type: CollisionType.Collision, priority: CollisionPriority.Normal };
};
