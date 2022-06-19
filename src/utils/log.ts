import chalk from 'chalk';

function log(...messages: string[]): void {
  return console.log(...messages.map((m) => chalk.grey(trimNewlineSpaces(m))));
}

export function warn(...messages: string[]): void {
  return console.warn(...messages.map((m) => chalk.yellow(trimNewlineSpaces(m))));
}

export function logRequest(url: string): void {
  return console.log(`requesting ${chalk.cyan(url)}`);
}

export function proxyLog<DataType>(data: DataType): DataType {
  console.log(data);

  return Array.isArray(data)
    ? proxyLogLength(data) as unknown as DataType
    : data;
}

export function proxyLogLength<ListItemType>(data: ListItemType[]): ListItemType[] {
  console.log(data.length);

  return data;
}

function trimNewlineSpaces(message: string): string {
  return message.trim().replace(/\n\s+/g, '\n');
}

export function stripMultiline(message: string): string {
  return message.replace(/\n\s+/g, ' ');
}

export default log;
