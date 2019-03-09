import {isDateStringValid, getYesterdayDateString, dateToString} from '../date';

describe('date utils', () => {
  // @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse
  describe('isDateStringValid()', () => {
    test('returns "false" for non-dates', () => {
      expect(isDateStringValid('')).toBe(false);
      expect(isDateStringValid('non-date')).toBe(false);
      expect(isDateStringValid('2012-something')).toBe(false);
      expect(isDateStringValid('1998-14')).toBe(false);
    });

    test('returns "true" for "YYYY-[MM-[DD]]" strings and other ISO 8601 formats', () => {
      expect(isDateStringValid('2119')).toBe(true);
      expect(isDateStringValid('2015-Apr')).toBe(true);
      expect(isDateStringValid('1998-04')).toBe(true);
      expect(isDateStringValid('1969-07-20')).toBe(true);
    });
  });

  describe('getYesterdayDateString()', () => {
    let dateNowMock: jest.SpyInstance = null;

    function setToday(dateString: string) {
      dateNowMock.mockImplementation(() => new Date(dateString).getTime());
    }

    beforeEach(() => {
      dateNowMock = jest.spyOn(Date, 'now');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('shifts current (mocked) date by one day back', () => {
      setToday('2019-03-09');
      expect(getYesterdayDateString()).toBe('2019-03-08');

      setToday('2007-02-01');
      expect(getYesterdayDateString()).toBe('2007-01-31');

      setToday('2000-01-01');
      expect(getYesterdayDateString()).toBe('1999-12-31');
    });
  });

  describe('dateToString()', () => {
    test('formats a given date as YYYY-MM-DD', () => {
      expect(dateToString(new Date('2002'))).toBe('2002-01-01');
      expect(dateToString(new Date('1995-08'))).toBe('1995-08-01');
      expect(dateToString(new Date('1897-11-28'))).toBe('1897-11-28');
      expect(dateToString(new Date('1600-10-05 08:15:20'))).toBe('1600-10-05');
    });
  });
});
