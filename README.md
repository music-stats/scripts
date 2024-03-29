# music-stats scripts

  [![license][license-image]][license-url]
  ![code size][code-size-image]

SHOULD become an API gateway between different front-ends and various data providers, currently a set of scripts.

## Tech stack
dev deps:
[`typescript`](https://www.typescriptlang.org/docs/),
[`jest`](https://jestjs.io/docs/expect/).

deps:
[`node`](https://nodejs.org/api/),
[`ramda`](http://ramdajs.com/docs/),
[`axios`](https://github.com/axios/axios/),
[`chalk`](https://github.com/chalk/chalk/) ([`v4.1.2`](https://github.com/chalk/chalk/releases/tag/v4.1.2) is used instead of [`v5.0.0`](https://github.com/chalk/chalk/releases/tag/v5.0.0) due to ESM, see [this guide](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c#how-can-i-make-my-typescript-project-output-esm) to migrate).

deps to consider for the server-side application:
[`koa`](http://koajs.com/#application).

## APIs, datasets
### In use
- [x] [GeoJSON Regions](https://geojson-maps.ash.ms/) (underlying source: [Natural Earth](http://naturalearthdata.com/))
- [x] [last.fm](https://www.last.fm/api/intro)
  - [x] [`library.getArtists`](https://www.last.fm/api/show/library.getArtists)
  - [x] [`user.getRecentTracks`](https://www.last.fm/api/show/user.getRecentTracks)
  - [ ] [`user.getTopArtists`](https://www.last.fm/api/show/user.getTopArtists) (pagination is fine)
  - [ ] [`user.getArtistTracks`](https://www.last.fm/api/show/user.getArtistTracks) (pagination seems to be weird, always giving `"totalPages": "0"`)
  - [ ] [`artist.getInfo`](https://www.last.fm/api/show/artist.getInfo) and [`track.getInfo`](https://www.last.fm/api/show/track.getInfo) (there are also `artist.getTags` and `track.getTags` endpoints but those simply return lists of tag names and URLs, while `.getInfo` also supplies tags plus additional data, e.g. track duration)
- [x] [MusicBrainz](https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2)
- [x] [ISO 3166-1 alpha-2](https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2) country codes as [JSON](https://gist.github.com/ssskip/5a94bfcd2835bf1dea52)

### To consider
- [ ] [Spotify](https://developer.spotify.com/documentation/web-api/reference/)
- [ ] [Songkick](https://www.songkick.com/developer/upcoming-events)
- [ ] [FMA (Free Music Archive)](https://github.com/mdeff/fma)
- [ ] [DuckDuckGo Instant Answers](https://duckduckgo.com/api)

On Spotify, only [Personalization API](https://developer.spotify.com/documentation/web-api/reference/personalization)
is available now (among other endpoints, but that's the only section about the user's listening habits),
restricting to top 50 artists/tracks. And it doesn't provide any measurable metric except "popularity"
which is some abstract (i.e. calculated) affinity level. Geo data (e.g. country) is also not there.

## Setup
### Environment variables
Create a `.env` file and fill its values according to [`.env.template`](.env.template):
* `LASTFM_API_KEY` (see last.fm [docs](https://www.last.fm/api/authentication))

### Commands
```bash
$ npm ci               # install deps
$ npm run lint         # lint scripts
$ npm test             # run unit tests
$ npm run build        # compile TypeScript
$ npm run build:watch  # compile with watch
```

## Terminology
In this repository, locations are called *areas*, not *countries* (like in [music-stats/map](https://github.com/music-stats/map)).
Even though country codes are used in the resulting `merged-artists` dataset, name *area* was chosen because MusicBrainz
uses it in their schema - it can represent countries, regions or cities.

## Scripts
### Artist-area map
#### Fetch top artists for a given last.fm user
```bash
$ npm run script:artist-area-map:1-fetch-artists [50] [--] [--no-color] [--no-cache]
#                                                 ^
#                                                 number of artists, default is set in the config
```

##### Input
Username is set in `src/config.ts`.

##### Output
Filename: `output/artist-area-map/1-lastfm-user-library.json`.

Content:
```js
[ { name: 'Dream Theater',
    playcount: 769,
    mbid: '28503ab7-8bf2-4666-a7bd-2644bfc7cb1d' }, // MusicBrainz ID
  { name: 'Queen',
    playcount: 757,
    mbid: '420ca290-76c5-41af-999e-564d7c71f1a7' },
  ...
  { name: 'Обійми Дощу',
    playcount: 222,
    mbid: 'fdafffec-3f14-442b-9700-1b52b89351ed' },
  { name: 'Lake of Tears',
    playcount: 214,
    mbid: '62cfcc64-a7d2-4ec2-ab4b-2a6b62e53940' } ]
```

#### Fetch areas for a given set of artists
```bash
$ npm run script:artist-area-map:2-fetch-artists-areas [10] [--] [--no-color] [--no-cache]
#                                                       ^
#                                                       number of artists, default is set in the config
```

##### Input
An output of `npm run script:artist-area-map:1-fetch-artists`.

##### Output
Filename: `output/artist-area-map/2-musicbrainz-artists-areas.json`.

Content:
```js
[ { artist: 'Dream Theater', area: 'New York' }, // New York will be mapped to United States, individual cities aren't supported
  { artist: 'Queen', area: 'Japan' }, // Japan? "mbid" received from last.fm must be wrong, area will be switched to United Kingdom
  ...
  { artist: 'Обійми Дощу', area: 'Ukraine' },
  { artist: 'Lake of Tears', area: 'Sweden' } ]
```

#### Merge results of two scripts above
```bash
$ npm run script:artist-area-map:3-merge-artists [--] [--no-color]
```

##### Input
Expects both input files (`.json`) to be located at `output/artist-area-map/`.
Blends them together, applies three stages of corrections (see `data/corrections/`),
sorts alphabetically by artist name and puts "ISO 3166-1 alpha-2" country codes as area names.

Each `[artist, playcount, countryCode]` entry is placed on a separate line to make diffs easier to digest.

##### Output
Filename: `output/artist-area-map/3-merged-artists.json`.

Content:
```js
[ [ 'Dream Theater', 769, 'US' ],
  [ 'Lake of Tears', 214, 'SE' ],
  [ 'Queen', 757, 'GB' ],
  [ 'Обійми Дощу', 222, 'UA' ],
  ... ]
```

#### Prepare country borders GeoJSON
* Filters out countries not mentioned in the merged artists dataset.
* Trims unused properties from the "GeoJSON Regions" dataset.
```bash
$ npm run script:artist-area-map:4-trim-world-map [--] [--no-color]
```

##### Input
* An output of `npm run script:artist-area-map:3-merge-artists`.
* A GeoJSON file with country borders is located at `input/world.geo.json`.

##### Output
Filename: `output/artist-area-map/4-world.geo.json`.

### Scrobble timeline
#### Fetch all scrobbles
```bash
$ npm run script:scrobble-timeline:1-fetch-scrobbles [2019-02-25] [2019-03-10] [--] [--no-color] [--no-cache]
#                                                     ^            ^
#                                                     |            date to (YYYY-MM-DD), defaults to today
#                                                     |
#                                                     date from (YYYY-MM-DD), defaults to yesterday
```

##### Input
None.

##### Output
Filename: `output/scrobble-timeline/1-scrobbles/2019-02-25--2019-03-10.json`.

Content:
```js
[ [ '2019-03-10 18:13',       // date
    'Handle This',            // track name
    2,                        // track playcount
    'All Killer, No Filler',  // album name
    28,                       // album playcount
    'Sum 41',                 // artist name
    33 ],                     // artist playcount
  ... ]
```

#### Merge all fetched scrobbles together
```bash
$ npm run script:scrobble-timeline:2-merge-scrobbles [--] [--no-color]
```

##### Input
Expects input files (`.json`) to be located at `output/scrobble-timeline/1-scrobbles/`.

##### Output
Filename: `output/scrobble-timeline/2-merged-scrobbles.json`.

Content: same as from the fetching commands, but everything put into a single chronological collection with playcount values aggregated.

[license-image]: https://img.shields.io/github/license/music-stats/scripts.svg?style=flat-square
[license-url]: https://github.com/music-stats/scripts/blob/master/LICENSE
[code-size-image]: https://img.shields.io/github/languages/code-size/music-stats/scripts.svg?style=flat-square
