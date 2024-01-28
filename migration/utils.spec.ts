import { arrayFromBooleanMap, mapBoolean, mapLanguage, mapLevel, mapRole } from './utils';

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
