import {Scrobble, ScrobbleList} from 'src/types/scrobble';

export default function merge(scrobbleListList: ScrobbleList[]): ScrobbleList {
  const registry: {[key: string]: true} = {};
  const result: ScrobbleList = [];
  const insertOrSkip = (scrobble: Scrobble): void => {
    const {date, artist, track} = scrobble;
    const key = `${date} - ${artist.name} - ${track.name}`;

    if (!registry[key]) {
      registry[key] = true;
      result.push(scrobble);
    }
  };

  scrobbleListList.forEach((scrobbleList) => scrobbleList.forEach(insertOrSkip));

  return result;
}
