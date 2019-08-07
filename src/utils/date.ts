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
  const date = new Date();

  date.setTime(uts * 1000);

  return dateToDateTimeString(date);
}

export function dateToUnixTimeStamp(date: Date) {
  return Math.round(date.getTime() / 1000);
}

export function dateToString(date: Date): string {
  return [
    date.getFullYear(),
    leftPadDatePart(date.getMonth() + 1),
    leftPadDatePart(date.getDate()),
  ].join('-');
}

function dateToTimeString(date: Date): string {
  return [
    leftPadDatePart(date.getHours()),
    leftPadDatePart(date.getMinutes()),
  ].join(':');
}

function dateToDateTimeString(date: Date): string {
  return [
    dateToString(date),
    dateToTimeString(date),
  ].join(' ');
}

function leftPadDatePart(value: number): string {
  if (value < 10) {
    return `0${value}`;
  }

  return value.toString();
}
