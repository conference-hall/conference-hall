import { endOfDay, parse, startOfDay } from 'date-fns';
import { format as formatZT, fromZonedTime as fromZT, toZonedTime as toZT } from 'date-fns-tz';

// TODO: Add missing tests
// TODO: Move all usages of `date-fns-tz` in this file

// todo(i18n): use locale in date formatting

// todo(tests)
export function toZonedTime(date: Date | string, timezone: string) {
  return toZT(date, timezone);
}

// todo(tests)
export function fromZonedTime(date: Date | string, timezone: string) {
  return fromZT(date, timezone);
}

// todo(tests)
export function formatInTimeZone(date: Date, format: string, timezone: string) {
  return formatZT(date, format, { timeZone: timezone });
}

// Get user timezone
export function getUserTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

// List all timzones
export function getTimezonesList() {
  const timezones = Intl.supportedValuesOf('timeZone');

  const timezoneObjects = timezones.map((tz) => {
    const now = new Date();

    // TZ Offset
    const tzFormatShort = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' });
    const timezoneOffset = tzFormatShort.formatToParts(now).find((part) => part.type === 'timeZoneName')?.value;
    const offsetName = timezoneOffset === 'GMT' ? 'GMT+00:00' : timezoneOffset;

    // TZ Long name
    const tzFormatLong = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longGeneric' });
    const longName = tzFormatLong.formatToParts(now).find((part) => part.type === 'timeZoneName')?.value;

    return {
      id: tz,
      name: `(${offsetName}) ${longName} - ${tz.replace('_', ' ')}`,
      longName: longName,
      offset: parseOffset(offsetName), // Convert offset to number for sorting
    };
  });

  // Sort timezoneObjects
  return timezoneObjects
    .sort((a, b) => {
      if (a.offset !== b.offset) {
        return a.offset - b.offset; // Sort by offset numerically
      } else if (a.longName && b.longName) {
        return a.longName.localeCompare(b.longName); // If offset is the same, sort by timeZoneName alphabetically
      } else {
        return a.id.localeCompare(b.id); // Fallback, sort by id alphabetically
      }
    })
    .map(({ id, name }) => ({ id, name }));
}

// Get GMT offset from a timezone
export function getGMTOffset(timezone: string) {
  const date = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', { timeZone: timezone, timeZoneName: 'short' });
  const parts = formatter.formatToParts(date);

  // Find the GMT offset part
  const gmtOffsetPart = parts.find((part) => part.type === 'timeZoneName');
  if (!gmtOffsetPart) return null;
  return gmtOffsetPart.value.replace('UTC', 'GMT');
}

// Function to parse offset string to number
function parseOffset(offset?: string) {
  if (offset === undefined) return -1000;
  const [hours, minutes] = offset.replace('GMT', '').split(':');
  const parsedOffset = Number.parseInt(hours, 10) * 60 + Number.parseInt(minutes, 10);
  return parsedOffset;
}

// Parse a string date from a timezone and convert it to start of the day and UTC
export function parseToUtcStartOfDay(date: string, timezone: string, format = 'yyyy-MM-dd') {
  return fromZonedTime(startOfDay(parse(date, format, toZonedTime(new Date(), timezone))), timezone);
}

// Parse a string date from a timezone and convert it to end of the day and UTC
export function parseToUtcEndOfDay(date: string, timezone: string, format = 'yyyy-MM-dd') {
  return fromZonedTime(endOfDay(parse(date, format, toZonedTime(new Date(), timezone))), timezone);
}

// Convert a timezoned date to UTC and format it to ISO format
export function formatZonedTimeToUtc(date: Date, timezone: string) {
  return fromZonedTime(date, timezone).toISOString();
}
