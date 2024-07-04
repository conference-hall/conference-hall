// TODO: Add tests

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
  const parsedOffset = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  return parsedOffset;
}
