import {Scrobble} from 'src/types/scrobble';
import {RecentTrack as LastfmRecentTrack} from 'src/types/lastfm';

import config from 'src/config';
import {writeFile} from 'src/utils/file';
import log, {proxyLogLength} from 'src/utils/log';
import {
  isDateStringValid,
  compareDateStrings,
  dateToUnixTimeStamp,
  dateToString,
  dateToEndDayDate,
  getTodayDateString,
  getYesterdayDateString,
  unixTimeStampToDateTimeString,
} from 'src/utils/date';
import {fetchRecentTracks} from 'src/ETL/extractors/lastfm';
import {aggregatePlaycounts} from 'src/ETL/transformers/aggregate';

const argv = process.argv.slice(2);

if (argv[0] && !isFlagArg(argv[0]) && !isDateStringValid(argv[0])) {
  console.error(`The "from" argument must have the "YYYY-MM-DD" format. Received "${argv[0]}".`)
  process.exit(1);
}

if (argv[1] && !isFlagArg(argv[1]) && !isDateStringValid(argv[1])) {
  console.error(`The "to" argument must have the "YYYY-MM-DD" format. Received "${argv[1]}".`)
  process.exit(1);
}

const from = argv[0] && !isFlagArg(argv[0]) && dateToString(new Date(argv[0])) || getYesterdayDateString();
const to = argv[1] && !isFlagArg(argv[1]) && dateToString(new Date(argv[1])) || getTodayDateString();
const toBypassCache = argv.includes('--no-cache');

if (compareDateStrings(from, to) > 0) {
  console.error(`"from" (${from}) must be less than "to" (${to})`);
  process.exit(1);
}

function isFlagArg(value: string): boolean {
  // e.g. "--no-color", "--no-cache"
  return value.startsWith('--');
}

function extract(): Promise<LastfmRecentTrack[]> {
  log(`fetching "${from} - ${to}" recent tracks from last.fm...`);

  return fetchRecentTracks(
    config.connectors.lastfm.username,
    dateToUnixTimeStamp(new Date(from)),
    dateToUnixTimeStamp(dateToEndDayDate(new Date(to))),
    toBypassCache,
  );
}

function transform(rawRecentTrackList: LastfmRecentTrack[]): Scrobble[] {
  // @todo: apply corrections before aggregating playcount sums
  return aggregatePlaycounts(
    rawRecentTrackList
      .filter(({date}) => date) // now playing track doesn't have "date"
      .reverse() // scrobbles originally come in reversed chronological order
      .map(convert),
  );
}

function convert({name, date, album, artist}: LastfmRecentTrack): Scrobble {
  return {
    date: unixTimeStampToDateTimeString(parseInt(date.uts, 10)),
    track: {
      name,
      playcount: null,
    },
    album: {
      name: album['#text'],
      playcount: null,
    },
    artist: {
      name: artist['#text'],
      playcount: null,
    },
  };
}

function load(scrobbleList: Scrobble[]): Promise<Scrobble[]> {
  const outputFilePath = config.scripts.scrobbleTimeline.fetchScrobbles.outputFilePath.replace(
    '<from>--<to>',
    `${from}--${to}`,
  );

  log();
  log(`writing to "${outputFilePath}"`);

  return writeFile(outputFilePath, scrobbleList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLogLength)
  .catch(console.error);
