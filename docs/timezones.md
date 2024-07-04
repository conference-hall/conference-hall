# Timezones

## Guidelines

Backend

- Always store date time in UTC on the server side.
- Always send date times as UTC in ISO 8601.
- Make sure the date-time is in UTC when we’re handling it with our back-end code.

Frontend

- Date time data in formatted strings are for display.
- Only convert with user time zone on the presentation layer.
- When front-end send requests to the back-end, send the date time in ISO 8601, so that the back-end can easily convert it to the corresponding UTC date time.

Common

- All these written back-end and front-end codes should have the user’s time zone-specific unit tests
- Single source of “now”. If we need the current time on the client, just get the user’s time zone from our user’s information request and calculate the Now date with it
- In code base related to all these time zone functionalities, there should be helper functions where the source of accuracy is the only one

## Event timezones

`// TODO`
