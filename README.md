# music-stats scripts

  [![license][license-image]][license-url]
  ![code size][code-size-image]

SHOULD become an API gateway between the front-end and various data providers, currently a set of scripts.

## Tech stack

dev deps:
[`typescript`](https://www.typescriptlang.org/docs).

deps:
[`node`](https://nodejs.org/dist/latest/docs/api) (at least v10, since experimental [`fs.promises` API](https://nodejs.org/dist/latest/docs/api/fs.html#fs_fs_promises_api) is used),
[`ramda`](http://ramdajs.com/docs),
[`axios`](https://github.com/axios/axios).

deps to consider for the server-side application: [`koa`](http://koajs.com/#application).

## APIs, datasets

### In use

- [x] [last.fm](https://www.last.fm/api/intro)
- [x] [MusicBrainz](https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2)

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
$ yarn install      # install deps
$ yarn build        # compile TypeScript
$ yarn build:watch  # compile with watch
```

## Scripts

### Artist-area map

#### Fetch top artists for a given last.fm user

```bash
$ yarn script:artist-area-map:1-fetch-artists [50] [--no-color] [--no-cache]
#                                              ^
#                                              number of artists, default is set in the config
```

##### Input prerequisites

Username is set in `src/config.ts`.

##### Example output

Filename: `output/artist-area-map/1-lastfm-user-library.json`.

Content:

```js
[ { name: 'Dream Theater',
    playcount: 769,
    mbid: '28503ab7-8bf2-4666-a7bd-2644bfc7cb1d' }, // MusicBrainz id
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
$ yarn script:artist-area-map:2-fetch-artists-areas [10] [--no-color] [--no-cache]
#                                                    ^
#                                                    number of artists, default is set in the config
```

##### Input prerequisites

Expects an output of
`script:artist-area-map:1-fetch-artists`
to be located at
`output/artist-area-map/1-lastfm-user-library.json`.

##### Example output

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
$ yarn script:artist-area-map:3-merge-artists [--no-color]
```

##### Input prerequisites

Expects both input files (`.json`) to be located at `output/artist-area-map/`.
Blends them together, applying three stages of corrections (see `data/corrections/`).

##### Example output

Filename: `output/artist-area-map/3-merged-artists.json`.

Content:

```js
[ { name: 'Dream Theater',
    playcount: 769,
    area: 'United States' },
  { name: 'Queen',
    playcount: 757,
    area: 'United Kingdom' },
  ...
  { name: 'Обійми Дощу',
    playcount: 222,
    area: 'Ukraine' },
  { name: 'Lake of Tears',
    playcount: 214,
    area: 'Sweden' } ]
```

### Scrobble timeline

#### Fetch all scrobbles

```bash
$ yarn script:scrobble-timeline:1-fetch-scrobbles [2019-02-25] [--no-color] [--no-cache]
#                                                  ^
#                                                  date from (YYYY-MM-DD), defaults to yesterday
```

##### Input prerequisites

None.

##### Example output

```js
[ { date: '2019-02-26 18:13',
    track: {
      name: 'Re-Align',
      playcount: 6,
      mbid: '0a2da65c-dcff-3837-beb7-0dc1697870ee' },
    album: {
      name: 'Good Times, Bad Times - Ten Years of Godsmack',
      playcount: 28,
      mbid: 'a54420cf-e577-4607-976e-2d5eee07daa7' },
    artist: {
      name: 'Godsmack',
      playcount: 205,
      mbid: 'ac2d1c91-3667-46aa-9fe7-170ca7fce9e2' } },
  ...
  { date: '2019-02-25 08:38',
    track: {
      name: 'Handle This',
      playcount: 2,
      mbid: '1974be37-81b4-3d2c-aed3-1a7c51847513' },
    album: {
      name: 'All Killer, No Filler',
      playcount: 33,
      mbid: null },
    artist: {
      name: 'Sum 41',
      playcount: 33,
      mbid: 'f2eef649-a6d5-4114-afba-e50ab26254d2' } ]
```

[license-image]: https://img.shields.io/github/license/music-stats/scripts.svg?style=flat-square
[license-url]: https://github.com/music-stats/scripts/blob/master/LICENSE
[code-size-image]: https://img.shields.io/github/languages/code-size/music-stats/scripts.svg?style=flat-square
