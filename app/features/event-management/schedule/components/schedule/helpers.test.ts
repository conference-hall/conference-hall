import { CollisionPriority, CollisionType } from '@dnd-kit/abstract';
import { Point, Rectangle } from '@dnd-kit/geometry';
import { countIntervalsInTimeSlot } from '~/shared/datetimes/timeslots.ts';
import type { ScheduleSession } from '../schedule.types.ts';
import { SESSIONS_GAP_PX, TIMESLOT_HEIGHTS } from './config.ts';
import { getSessionHeight, getTimeslotHeight, topInsideDroppable } from './helpers.ts';

describe('getTimeslotHeight', () => {
  it('returns the correct height for a valid zoom level', () => {
    for (let i = 0; i < TIMESLOT_HEIGHTS.length; i++) {
      expect(getTimeslotHeight(i)).toBe(TIMESLOT_HEIGHTS[i]);
    }
  });

  it('returns the default height for an invalid zoom level', () => {
    expect(getTimeslotHeight(-1)).toBe(TIMESLOT_HEIGHTS[0]);

    const invalidZoomLevel = TIMESLOT_HEIGHTS.length + 5;
    expect(getTimeslotHeight(invalidZoomLevel)).toBe(TIMESLOT_HEIGHTS[0]);
  });
});

describe('getSessionHeight', () => {
  let session: ScheduleSession;

  beforeEach(() => {
    session = {
      id: 'session-1',
      trackId: 'track-1',
      timeslot: {
        start: new Date('2023-01-01T09:00:00'),
        end: new Date('2023-01-01T10:00:00'),
      },
      emojis: [],
      color: '#ff0000',
      language: null,
      proposal: null,
    };
  });

  it('calculates correct height for a session based on intervals and zoom level', () => {
    const interval = 30;
    const zoomLevel = 1;

    // Calculate expected intervals
    const intervalsCount = countIntervalsInTimeSlot(session.timeslot, interval);
    const expectedHeight = TIMESLOT_HEIGHTS[zoomLevel] * intervalsCount - SESSIONS_GAP_PX;

    expect(getSessionHeight(session, interval, zoomLevel)).toBe(expectedHeight);
  });

  it('calculates different heights for different timeslots', () => {
    const interval = 30;
    const zoomLevel = 0;

    // Test with first timeslot
    const intervalsCount1 = countIntervalsInTimeSlot(session.timeslot, interval);
    const expectedHeight1 = TIMESLOT_HEIGHTS[zoomLevel] * intervalsCount1 - SESSIONS_GAP_PX;
    expect(getSessionHeight(session, interval, zoomLevel)).toBe(expectedHeight1);

    // Test with a different timeslot
    session.timeslot = { start: new Date('2023-01-01T10:00:00'), end: new Date('2023-01-01T11:30:00') };
    const intervalsCount2 = countIntervalsInTimeSlot(session.timeslot, interval);
    const expectedHeight2 = TIMESLOT_HEIGHTS[zoomLevel] * intervalsCount2 - SESSIONS_GAP_PX;
    expect(getSessionHeight(session, interval, zoomLevel)).toBe(expectedHeight2);
  });
});

describe('topInsideDroppable', () => {
  it('detects when top center point is inside droppable', () => {
    const dragRect = new Rectangle(100, 50, 100, 200);
    const dropRect = new Rectangle(0, 0, 300, 300);

    const result = topInsideDroppable({
      dragOperation: {
        shape: {
          current: { boundingRectangle: dragRect },
        },
      },
      droppable: {
        id: 'drop-1',
        shape: { boundingRectangle: dropRect },
      },
    } as any);

    expect(result).toEqual({
      id: 'drop-1',
      value: 1,
      type: CollisionType.Collision,
      priority: CollisionPriority.Normal,
    });
  });

  it('calculates distance value when top center is outside droppable', () => {
    const dragRect = new Rectangle(100, 350, 100, 200); // Outside the droppable
    const dropRect = new Rectangle(0, 0, 300, 300);

    const topCenter = { x: 150, y: 350 };
    const dropTopCenter = { x: 150, y: 0 };
    const distance = Point.distance(topCenter, dropTopCenter);
    const expectedValue = 1 / distance;

    const result = topInsideDroppable({
      dragOperation: {
        shape: {
          current: { boundingRectangle: dragRect },
        },
      },
      droppable: {
        id: 'drop-1',
        shape: { boundingRectangle: dropRect },
      },
    } as any);

    expect(result).toEqual({
      id: 'drop-1',
      value: expectedValue,
      type: CollisionType.Collision,
      priority: CollisionPriority.Normal,
    });
  });
});
