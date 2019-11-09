# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [1.1.0] - 2019-11-03
### Added
#### Scrobble timeline
Merging script for imported scrobbles. Corrections are not applied yet.
```bash
$ npm run script:scrobble-timeline:2-merge-scrobbles
```

## [1.0.0] - 2019-10-13
### Changed
#### Artist-area map
* Dataset format update: `[[artist, playcount, countryCode], ...]` (with "ISO 3166-1 alpha-2" country codes).

## [0.0.1] - 2019-08-23
### Added
Added the CHANGELOG.
Current list of features:

#### Artist-area map
Established, mainly deps and corrections receive updates.
```bash
$ npm run script:artist-area-map:1-fetch-artists
$ npm run script:artist-area-map:2-fetch-artists-areas
$ npm run script:artist-area-map:3-merge-artists
```

#### Scrobble timeline
In development, data format and API may change.
```bash
$ npm run script:scrobble-timeline:1-fetch-scrobbles
```
