import {WorldGeoJson} from 'src/types/world';
import {CountryCodeDataset} from 'src/types/dataset';
import {Artist as LastfmArtist} from 'src/types/lastfm';
import {PackedArtist} from 'src/types/artist';

import config from 'src/config';
import {readJsonFile, readTxtMultilineFolder, TxtMultilineFolderContent} from 'src/utils/file';

export function loadCountryCodeDataset(): Promise<CountryCodeDataset> {
  return readJsonFile(config.datasets.countryCodes.filePath);
}

export function loadWorldGeoJson(): Promise<WorldGeoJson> {
  return readJsonFile(config.scripts.artistAreaMap.trimWorldMap.inputFilePath);
}

export function loadLastfmArtistList(): Promise<LastfmArtist[]> {
  return readJsonFile(config.scripts.artistAreaMap.fetchArtist.outputFilePath);
}

export function loadMergedArtistList(): Promise<PackedArtist[]> {
  return readJsonFile(config.scripts.artistAreaMap.mergeArtists.outputFilePath);
}

export function loadArtistListByGenreDataset(): Promise<TxtMultilineFolderContent> {
  return readTxtMultilineFolder('');
}
