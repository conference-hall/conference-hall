import { endOfDay, parse, startOfDay } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

/** Convert UTC date to a specific timezone */
export function utcToTimezone(date: Date | string, timezone: string) {
  return toZonedTime(date, timezone);
}

/** Convert a date in a specific timezone to UTC */
export function timezoneToUtc(date: Date | string, timezone: string) {
  return fromZonedTime(date, timezone);
}

/** Get user timezone */
export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/** List all timezones */
export function getTimezonesList(locale: string) {
  const timezones = Intl.supportedValuesOf('timeZone');

  const timezoneObjects = timezones.map((tz) => {
    const now = new Date();

    // TZ Offset
    const tzFormatShort = new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: 'longOffset' });
    const timezoneOffset = tzFormatShort.formatToParts(now).find((part) => part.type === 'timeZoneName')?.value;
    const offsetName = timezoneOffset === 'GMT' ? 'GMT+00:00' : timezoneOffset;

    // TZ Long name
    const tzFormatLong = new Intl.DateTimeFormat(locale, { timeZone: tz, timeZoneName: 'longGeneric' });
    const longName = tzFormatLong.formatToParts(now).find((part) => part.type === 'timeZoneName')?.value;

    return { id: tz, name: `(${offsetName}) ${longName} - ${tz.replace('_', ' ')}` };
  });

  // Sort timezones by offset and name
  return timezoneObjects.sort((a, b) => a.name.localeCompare(b.name)).map(({ id, name }) => ({ id, name }));
}

/** Get GMT offset from a timezone */
export function getGMTOffset(timezone: string, locale: string) {
  const date = new Date();
  try {
    const formatter = new Intl.DateTimeFormat(locale, { timeZone: timezone, timeZoneName: 'short' });
    const parts = formatter.formatToParts(date);

    // Find the GMT offset part
    const gmtOffsetPart = parts.find((part) => part.type === 'timeZoneName');
    if (!gmtOffsetPart) return null;
    return gmtOffsetPart.value;
  } catch (_error) {
    return null;
  }
}

/** Parse a string date from a timezone and convert it to start of the day and UTC */
export function parseToUtcStartOfDay(date: string, timezone: string) {
  const refDate = utcToTimezone(new Date(), timezone);
  const parsedDate = parse(date, 'yyyy-MM-dd', refDate);
  return timezoneToUtc(startOfDay(parsedDate), timezone);
}

/** Parse a string date from a timezone and convert it to end of the day and UTC */
export function parseToUtcEndOfDay(date: string, timezone: string) {
  const refDate = utcToTimezone(new Date(), timezone);
  const parsedDate = parse(date, 'yyyy-MM-dd', refDate);
  return timezoneToUtc(endOfDay(parsedDate), timezone);
}
