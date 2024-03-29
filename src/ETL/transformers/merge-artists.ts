import {invertObj} from 'ramda';

import {Artist, ArtistArea, MergedArtist, PackedArtist} from 'src/types/artist';
import {ArtistNameCorrection, AreaCorrection, ArtistAreaCorrection, ParsedCorrections} from 'src/types/correction';
import {CountryCodeDataset} from 'src/types/dataset';

import log, {warn, stripMultiline} from 'src/utils/log';

interface ArtistLookup {
  [name: string]: Artist;
}

function deduplicateArtists(
  artistList: Artist[],
  artistNameCorrection: ArtistNameCorrection,
): Artist[] {
  const artistLookup: ArtistLookup = {};

  artistList.forEach((artist) => artistLookup[artist.name] = artist);

  Object.entries(artistNameCorrection).forEach(([name, correctName]) => {
    const artist = artistLookup[name];

    // it could be that some artist name appears in the correction list
    // but doesn't appear in the artist list (e.g. a known correction for future or simply removed artist)
    if (!artist) {
      warn(stripMultiline(`
        merge correction not needed: "${name}" -> "${correctName}"
        (artist not found in the playcount list)
      `));
      return;
    }

    const {playcount, mbid} = artist;

    if (correctName in artistLookup) {
      const correctArtist = artistLookup[correctName];
      const oldPlaycount = correctArtist.playcount;

      correctArtist.playcount += playcount;

      log(stripMultiline(`
        merged "${name}" into "${correctName}"
        (${oldPlaycount} + ${playcount} = ${correctArtist.playcount})
      `));

      if (mbid && mbid !== correctArtist.mbid) {
        warn(stripMultiline(`
          mbid mismatch:
          ("${name}" - "${mbid}"),
          ("${correctName}" - "${correctArtist.mbid}")
        `));
      }
    } else {
      artistLookup[correctName] = {
        name: correctName,
        playcount,
        mbid,
      };

      log(`renamed "${name}" to "${correctName}" (${playcount})`);
    }

    delete artistLookup[name];
  });

  return Object.values(artistLookup).sort((a, b) => b.playcount - a.playcount);
}

interface ArtistAreaLookup {
  [name: string]: string;
}

export function merge(
  artistList: Artist[],
  artistAreaList: ArtistArea[],
  corrections: ParsedCorrections,
): MergedArtist[] {
  const {artistNameCorrection, artistAreaCorrection, areaCorrection} = corrections;
  const artistAreaLookup: ArtistAreaLookup = {};

  artistAreaList.forEach(({artist, area}) => artistAreaLookup[artist] = area);

  return deduplicateArtists(artistList, artistNameCorrection)
    .map(({name, playcount}) => ({
      name,
      playcount,
      area: getArtistArea(
        name,
        playcount,
        artistAreaLookup,
        artistAreaCorrection,
        areaCorrection,
      ),
    }))
    .filter(({area}) => Boolean(area));
}

function getArtistArea(
  artist: string,
  playcount: number,
  artistAreaLookup: ArtistAreaLookup,
  artistAreaCorrection: ArtistAreaCorrection,
  areaCorrection: AreaCorrection,
): string {
  const correctArtistArea = artistAreaCorrection[artist];

  if (correctArtistArea) {
    return correctArtistArea;
  }

  const area = artistAreaLookup[artist];
  const correctArea = areaCorrection[area];

  if (correctArea) {
    // log(`corrected area for "${artist}": "${area}" -> "${correctArea}"`);
    return correctArea;
  }

  if (area) {
    return area;
  }

  // @todo: add a check against registered areas (countries), to highlight unknown cities/regions
  warn(`area not found: ${artist} (${playcount})`);

  return '';
}

export function convertToSortedList(
  artistList: MergedArtist[],
  countryCodeDataset: CountryCodeDataset,
): PackedArtist[] {
  const areaToCountryCode = invertObj(countryCodeDataset);

  return artistList
    .map(({name, playcount, area}) => {
      const countryCode = areaToCountryCode[area];

      if (!countryCode) {
        warn(`country code not found: ${area} (${name})`);
      }

      return [
        name,
        playcount,
        countryCode,
      ];
    })
    .sort((a: PackedArtist, b: PackedArtist) => a[0].toUpperCase() < b[0].toUpperCase() ? -1 : 1) as PackedArtist[];
}
