import {
  isDateStringValid,
  compareDateStrings,
  getTodayDateString,
  getYesterdayDateString,
  utcUtsToDateTimeString,
  dateToUtcUts,
  dateToString,
  dateToStartDayDate,
  dateToEndDayDate,
} from './date';

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

  describe('compareDateStrings()', () => {
    test('returns number of milliseconds between two dates', () => {
      expect(compareDateStrings('2005-06-14', '2008-06-14')).toBe(-94694400000);
      expect(compareDateStrings('2008-02-18', '2008-02-18')).toBe(0);
      expect(compareDateStrings('2012-10-28', '2011-01-05')).toBe(57196800000);
    });
  });

  describe('methods dealing with current date', () => {
    const RealDate = global.Date;

    function setToday(dateString: string): void {
      (global.Date as unknown) = class extends RealDate {
        constructor() {
          super(dateString);
        }

        public static now(): number {
          return new Date(dateString).getTime();
        }
      };
    }

    afterEach(() => {
      global.Date = RealDate;
    });

    describe('getTodayDateString()', () => {
      test('converts current (mocked) date to string', () => {
        setToday('2019-03-09');
        expect(getTodayDateString()).toBe('2019-03-09');

        setToday('2007-02-01');
        expect(getTodayDateString()).toBe('2007-02-01');

        setToday('2000-01-01');
        expect(getTodayDateString()).toBe('2000-01-01');
      });
    });

    describe('getYesterdayDateString()', () => {
      test('shifts current (mocked) date by one day back', () => {
        setToday('2019-03-09');
        expect(getYesterdayDateString()).toBe('2019-03-08');

        setToday('2007-02-01');
        expect(getYesterdayDateString()).toBe('2007-01-31');

        setToday('2000-01-01');
        expect(getYesterdayDateString()).toBe('1999-12-31');
      });
    });
  });

  describe('utcUtsToDateTimeString()', () => {
    test('converts a given Unix Time (seconds) to string as "YYYY-MM-DD HH:MM"', () => {
      expect(utcUtsToDateTimeString(1565122860)).toBe('2019-08-06 22:21');
      expect(utcUtsToDateTimeString(1562385900)).toBe('2019-07-06 06:05');
    });
  });

  describe('dateToUtcUts()', () => {
    test('converts a given date to Unix Time (seconds)', () => {
      expect(dateToUtcUts(new Date('2008'))).toBe(1199145600);
      expect(dateToUtcUts(new Date('2010-02'))).toBe(1264982400);
      expect(dateToUtcUts(new Date('1950-03-12'))).toBe(-625104000);
      expect(dateToUtcUts(new Date('2019-08-06 21:21'))).toBe(1565119260);
      expect(dateToUtcUts(new Date('2019-07-06 05:05'))).toBe(1562382300);
      expect(dateToUtcUts(new Date('2049-09-02'))).toBe(2514153600);
    });
  });

  describe('dateToString()', () => {
    test('formats a given date as "YYYY-MM-DD"', () => {
      expect(dateToString(new Date('2002'))).toBe('2002-01-01');
      expect(dateToString(new Date('1995-08'))).toBe('1995-08-01');
      expect(dateToString(new Date('1897-11-28'))).toBe('1897-11-28');
      expect(dateToString(new Date('1600-10-05 08:15:20'))).toBe('1600-10-05');
    });
  });

  describe('dateToStartDayDate()', () => {
    test('adds 23:59:59 (UTC) to a given date', () => {
      expect(dateToStartDayDate(new Date('2019-09-12')).toISOString()).toBe('2019-09-11T22:00:00.000Z');
      expect(dateToStartDayDate(new Date('2019-09-14 20:00')).toISOString()).toBe('2019-09-13T22:00:00.000Z');
    });
  });

  describe('dateToEndDayDate()', () => {
    test('adds 23:59:59 (UTC) to a given date', () => {
      expect(dateToEndDayDate(new Date('2019-09-12')).toISOString()).toBe('2019-09-12T21:59:59.000Z');
      expect(dateToEndDayDate(new Date('2019-09-14 20:00')).toISOString()).toBe('2019-09-14T21:59:59.000Z');
    });
  });
});
