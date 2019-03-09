export function isDateStringValid(value: string): boolean {
  return Boolean(Date.parse(value));
}

export function getYesterdayDateString(): string {
  const date = new Date();
  const msInOneDay = 24 * 60 * 60 * 1000;

  date.setTime(Date.now() - msInOneDay);

  return dateToString(date);
}

export function dateToString(date: Date): string {
  return [
    date.getFullYear(),
    leftPadDatePart(date.getMonth() + 1),
    leftPadDatePart(date.getDate()),
  ].join('-');
}

function leftPadDatePart(value: number): string {
  if (value < 10) {
    return `0${value}`;
  }

  return value.toString();
}
