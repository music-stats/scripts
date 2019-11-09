import {take} from 'ramda';

import {Artist as LastfmArtist} from 'src/types/lastfm';
import {Artist as MusicbrainzArtist} from 'src/types/musicbrainz';
import {ArtistArea} from 'src/types/artist';

import config from 'src/config';
import {sequence} from 'src/utils/promise';
import {writeFile} from 'src/utils/file';
import log, {proxyLogLength} from 'src/utils/log';
import {loadLastfmArtistList} from 'src/ETL/extractors/dataset';
import {fetchArtist} from 'src/ETL/extractors/musicbrainz';

const argv = process.argv.slice(2);
const artistsCount = parseInt(argv[0], 10) || config.connectors.musicbrainz.artists.countDefault;
const toBypassCache = argv.includes('--no-cache');

if (artistsCount <= 0) {
  throw new Error(`Expected a number of artists greater then 0, got ${artistsCount}`);
}

function proxyLogArtistsCount(artists: LastfmArtist[]): LastfmArtist[] {
  log(`fetching ${artists.length} artists from MusicBrainz...`);

  return artists;
}

function extract(): Promise<MusicbrainzArtist[]> {
  return loadLastfmArtistList()
    .then(take(artistsCount))
    .then((artists) => artists.filter(({mbid}) => Boolean(mbid))) // "mbid" is missing for some artists
    .then(proxyLogArtistsCount)
    .then((artists) => sequence(artists.map(({name, mbid}, index) => fetchArtist.bind(
      null,
      name,
      mbid,
      index,
      artists.length,
      toBypassCache,
    ))));
}

function transform(musicbrainzArtistList: MusicbrainzArtist[]): ArtistArea[] {
  return musicbrainzArtistList.map(convert);
}

function convert({name, area}: MusicbrainzArtist): ArtistArea {
  return {
    artist: name,
    area: area
      ? area.name
      : null,
  };
}

function load(artistAreaList: ArtistArea[]): Promise<ArtistArea[]> {
  const {outputFilePath} = config.scripts.artistAreaMap.fetchArtistsAreas;

  log();
  log(`writing to "${outputFilePath}"`);

  return writeFile(outputFilePath, artistAreaList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLogLength)
  .catch(console.error);
