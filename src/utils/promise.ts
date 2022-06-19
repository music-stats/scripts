export function delay<T>(promise: (...args: unknown[]) => Promise<T>, wait: number, ...args: unknown[]): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(
      () => {
        promise(...args)
          .then(resolve)
          .catch(reject);
      },
      wait,
    );
  });
}

type QueueableFunc<T> = () => Promise<T>;

export function sequence<T>(funcs: QueueableFunc<T>[]): Promise<T[]> {
  const results: T[] = [];
  const pushResult: ((result: T) => void) = (result: T) => results.push(result);
  const enqueueFuncs = (queue: Promise<void>, func: QueueableFunc<T>): Promise<void> => queue.then(() => func().then(pushResult));

  // @see: https://css-tricks.com/why-using-reduce-to-sequentially-resolve-promises-works
  return funcs.reduce(enqueueFuncs, Promise.resolve())
    .then(() => results);
}
