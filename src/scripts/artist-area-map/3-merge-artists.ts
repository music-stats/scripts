import {Artist, ArtistArea, PackedArtist} from 'src/types/artist';

import config from 'src/config';
import {readJsonFile, writeFile} from 'src/utils/file';
import log, {proxyLogLength} from 'src/utils/log';
import {loadAllCorrections} from 'src/ETL/extractors/correction';
import {loadCountryCodeDataset} from 'src/ETL/extractors/dataset';
import {merge, convertToSortedList} from 'src/ETL/transformers/merge-artists';

interface InputLists {
  artistList: Artist[];
  artistAreaList: ArtistArea[];
}

function extract(): Promise<InputLists> {
  return Promise.all([
    config.scripts.artistAreaMap.fetchArtist.outputFilePath,
    config.scripts.artistAreaMap.fetchArtistsAreas.outputFilePath,
  ].map(readJsonFile))
    .then(([artistList, artistAreaList]: [Artist[], ArtistArea[]]) => ({
      artistList,
      artistAreaList,
    }));
}

function transform({artistList, artistAreaList}: InputLists): Promise<PackedArtist[]> {
  return loadAllCorrections()
    .then((corrections) => merge(artistList, artistAreaList, corrections))
    .then((artistList) => loadCountryCodeDataset()
      .then((countryCodeDataset) => convertToSortedList(artistList, countryCodeDataset))
    );
}

function load(mergedArtistList: PackedArtist[]): Promise<PackedArtist[]> {
  const {outputFilePath} = config.scripts.artistAreaMap.mergeArtists;
  const splitArrayStringByLines = (value: string) => value.replace(/\],\[/g, '],\n[');

  log();
  log(`writing to "${outputFilePath}"`);

  return writeFile(outputFilePath, mergedArtistList, 0, splitArrayStringByLines);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLogLength)
  .catch(console.error);
