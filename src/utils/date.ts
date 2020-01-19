export function isDateStringValid(value: string): boolean {
  return Boolean(Date.parse(value));
}

export function compareDateStrings(a: string, b: string): number {
  const aDate = new Date(a);
  const bDate = new Date(b);

  return aDate.getTime() - bDate.getTime();
}

export function getTodayDateString(): string {
  return dateToString(new Date());
}

export function getYesterdayDateString(): string {
  const date = new Date();
  const msInOneDay = 24 * 60 * 60 * 1000;

  date.setTime(Date.now() - msInOneDay);

  return dateToString(date);
}

export function unixTimeStampToDateTimeString(uts: number): string {
  return (new Date(uts * 1000 - getTimezoneOffsetMs()))
    .toISOString()
    .slice(0, 16)
    .replace('T', ' ');
}

export function dateToUnixTimeStamp(date: Date): number {
  return Math.round((date.getTime() - getTimezoneOffsetMs()) / 1000);
}

export function dateToString(date: Date): string {
  return [
    date.getFullYear(),
    leftPadDatePart(date.getMonth() + 1),
    leftPadDatePart(date.getDate()),
  ].join('-');
}

function getTimezoneOffsetMs(): number {
  return (new Date()).getTimezoneOffset() * 60 * 1000;
}

function leftPadDatePart(value: number): string {
  if (value < 10) {
    return `0${value}`;
  }

  return value.toString();
}

export function dateToEndDayDate(date: Date): Date {
  date.setHours(23, 59, 59);

  return date;
}
