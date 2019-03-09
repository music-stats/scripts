// https://www.last.fm/api/show/user.getRecentTracks

// http://ws.audioscrobbler.com/2.0/?
//   method=user.getrecenttracks&
//   api_key=33650ee56ab71aee770161885f83054c&
//   format=json&
//   user=markhovskiy&
//   from=1263737600&
//   limit=200&
//   page=4

// {
//   "recenttracks": {
//     "@attr": {
//       "page": "4",
//       "perPage": "200",
//       "user": "markhovskiy",
//       "total": "48347",
//       "totalPages": "242"
//     },
//     "track": [
//       {
//         "name": "Re-Align",
//         "mbid": "0a2da65c-dcff-3837-beb7-0dc1697870ee",
//         "date": {
//           "uts": "1551204811",
//           "#text": "26 Feb 2019, 18:13"
//         },
//         "album": {
//           "mbid": "a54420cf-e577-4607-976e-2d5eee07daa7",
//           "#text": "Good Times, Bad Times - Ten Years of Godsmack"
//         },
//         "artist": {
//           "mbid": "ac2d1c91-3667-46aa-9fe7-170ca7fce9e2",
//           "#text": "Godsmack"
//         },
//         ...
//       },
//       ...
//     ]
//   }
// }

import config from 'src/config';
import {isDateArgValid, dateToString, getYesterdayDate} from 'src/utils/date';

const argv = process.argv.slice(2);

if (argv[0] && !isDateArgValid(argv[0])) {
  console.error('The "from" argument must have the "YYYY-MM-DD" format.')
  process.exit(1);
}

const from = argv[0] && dateToString(new Date(argv[0])) || getYesterdayDate();
const toBypassCache = argv.includes('--no-cache');

console.table([
  {
    name: 'username',
    value: config.connectors.lastfm.username,
  },
  {
    name: 'from',
    value: from,
  },
  {
    name: 'toBypassCache',
    value: toBypassCache,
  },
]);
