import {
  arrayFromBooleanMap,
  checkEmail,
  checkUrl,
  mapBoolean,
  mapEmailNotifications,
  mapEventType,
  mapEventVisibility,
  mapInteger,
  mapLanguage,
  mapLevel,
  mapRole,
  mapSurveyQuestions,
} from './utils.ts';

describe('#mapBoolean', () => {
  it('should return false if bool is undefined', () => {
    expect(mapBoolean()).toEqual(false);
    expect(mapBoolean(null)).toEqual(false);
    expect(mapBoolean('')).toEqual(false);
  });

  it('should return false if bool is false', () => {
    expect(mapBoolean('false')).toEqual(false);
  });

  it('should return true if bool is true', () => {
    expect(mapBoolean('true')).toEqual(true);
  });

  it('should return true if bool is truthy', () => {
    expect(mapBoolean('foo')).toEqual(true);
  });
});

describe('#mapInteger', () => {
  it('should return undefined if int is undefined', () => {
    expect(mapInteger()).toBeUndefined();
    expect(mapInteger(null)).toBeUndefined();
    expect(mapInteger('')).toBeUndefined();
  });

  it('should return undefined if int is not an integer', () => {
    expect(mapInteger('foo')).toBeUndefined();
  });

  it('should return the integer if int is an integer', () => {
    expect(mapInteger('42')).toEqual(42);
  });
});

describe('#checkUrl', () => {
  it('should return undefined if url is undefined', () => {
    expect(checkUrl()).toBeUndefined();
    expect(checkUrl(null)).toBeUndefined();
    expect(checkUrl('')).toBeUndefined();
  });

  it('should return undefined if url does not start with http', () => {
    expect(checkUrl('foo')).toBeUndefined();
  });

  it('should return the url if url starts with http', () => {
    expect(checkUrl('http://foo')).toEqual('http://foo');
  });
});

describe('#checkEmail', () => {
  it('should return undefined if email is undefined', () => {
    expect(checkEmail()).toBeUndefined();
    expect(checkEmail(null)).toBeUndefined();
    expect(checkEmail('')).toBeUndefined();
  });

  it('should return undefined if email is not an email', () => {
    expect(checkEmail('foo')).toBeUndefined();
  });

  it('should return the email if email is an email', () => {
    expect(checkEmail('test@email.com')).toEqual('test@email.com');
  });
});

describe('#arrayFromBooleanMap', () => {
  it('should return an empty array if map is undefined', () => {
    expect(arrayFromBooleanMap()).toEqual([]);
    expect(arrayFromBooleanMap(null)).toEqual([]);
    expect(arrayFromBooleanMap({})).toEqual([]);
  });

  it('should return an empty array if map is empty', () => {
    expect(arrayFromBooleanMap({ foo: false, bar: false })).toEqual([]);
  });

  it('should return an array of keys if map is not empty', () => {
    expect(arrayFromBooleanMap({ foo: true, bar: false })).toEqual(['foo']);
  });
});

describe('#mapLevel', () => {
  it('should return undefined if level is undefined', () => {
    expect(mapLevel()).toBeUndefined();
    expect(mapLevel(null)).toBeUndefined();
    expect(mapLevel('')).toBeUndefined();
  });

  it('should return undefined if level is not found', () => {
    expect(mapLevel('foo')).toBeUndefined();
  });

  it('should return the level if found', () => {
    expect(mapLevel('beginner')).toEqual('BEGINNER');
    expect(mapLevel('intermediate')).toEqual('INTERMEDIATE');
    expect(mapLevel('advanced')).toEqual('ADVANCED');
  });
});

describe('#mapLanguage', () => {
  it('should return undefined if language is undefined', () => {
    expect(mapLanguage()).toBeUndefined();
    expect(mapLanguage(null)).toBeUndefined();
    expect(mapLanguage('')).toBeUndefined();
  });

  it('should return undefined if language is not found', () => {
    expect(mapLanguage('foo')).toBeUndefined();
  });

  it('should return the language if found', () => {
    expect(mapLanguage('english')).toEqual(['en']);
    expect(mapLanguage('English')).toEqual(['en']);
  });
});

describe('#mapRole', () => {
  it('should return undefined if role is undefined', () => {
    expect(mapRole()).toBeUndefined();
    expect(mapRole(null)).toBeUndefined();
    expect(mapRole('')).toBeUndefined();
  });

  it('should return undefined if role is not found', () => {
    expect(mapRole('foo')).toBeUndefined();
  });

  it('should return the role if found', () => {
    expect(mapRole('owner')).toEqual('OWNER');
    expect(mapRole('member')).toEqual('MEMBER');
    expect(mapRole('reviewer')).toEqual('REVIEWER');
  });
});

describe('#mapEventType', () => {
  it('should return undefined if type is undefined', () => {
    expect(mapEventType()).toBeUndefined();
    expect(mapEventType(null)).toBeUndefined();
    expect(mapEventType('')).toBeUndefined();
  });

  it('should return undefined if type is not found', () => {
    expect(mapEventType('foo')).toBeUndefined();
  });

  it('should return the type if found', () => {
    expect(mapEventType('conference')).toEqual('CONFERENCE');
    expect(mapEventType('meetup')).toEqual('MEETUP');
  });
});

describe('#mapEventVisibility', () => {
  it('should return undefined if visibility is undefined', () => {
    expect(mapEventVisibility()).toBeUndefined();
    expect(mapEventVisibility(null)).toBeUndefined();
    expect(mapEventVisibility('')).toBeUndefined();
  });

  it('should return undefined if visibility is not found', () => {
    expect(mapEventVisibility('foo')).toBeUndefined();
  });

  it('should return the visibility if found', () => {
    expect(mapEventVisibility('public')).toEqual('PUBLIC');
    expect(mapEventVisibility('private')).toEqual('PRIVATE');
  });
});

describe('#mapSurveyQuestions', () => {
  it('should return undefined if survey is undefined', () => {
    expect(mapSurveyQuestions()).toBeUndefined();
    expect(mapSurveyQuestions(null)).toBeUndefined();
    expect(mapSurveyQuestions('')).toBeUndefined();
  });

  it('should return the survey if found', () => {
    expect(mapSurveyQuestions({})).toEqual([]);

    expect(
      mapSurveyQuestions({
        gender: true,
        tshirt: true,
        diet: true,
        accomodation: true,
        transports: true,
        info: true,
        foo: true,
        bar: false,
      }),
    ).toEqual(['gender', 'tshirt', 'diet', 'accomodation', 'transports', 'info']);

    expect(
      mapSurveyQuestions({
        gender: true,
        tshirt: false,
        diet: false,
      }),
    ).toEqual(['gender']);
  });
});

describe('#mapEmailNotifications', () => {
  it('should return undefined if emails is undefined', () => {
    expect(mapEmailNotifications()).toBeUndefined();
    expect(mapEmailNotifications(null)).toBeUndefined();
    expect(mapEmailNotifications('')).toBeUndefined();
  });

  it('should return the emails if found', () => {
    expect(mapEmailNotifications({})).toEqual([]);

    expect(
      mapEmailNotifications({
        submitted: true,
        confirmed: true,
        declined: true,
        foo: true,
        bar: false,
      }),
    ).toEqual(['submitted', 'confirmed', 'declined']);

    expect(
      mapEmailNotifications({
        submitted: true,
        confirmed: false,
        declined: false,
      }),
    ).toEqual(['submitted']);
  });
});
