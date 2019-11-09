import {pick, includes, uniq} from 'ramda';

import {WorldGeoJson, AreaGeoJson} from 'src/types/world';
import {PackedArtist} from 'src/types/artist';

import config from 'src/config';
import {writeFile} from 'src/utils/file';
import log, {proxyLogLength} from 'src/utils/log';
import {loadWorldGeoJson, loadMergedArtistList} from 'src/ETL/extractors/dataset';

interface InputLists {
  mergedArtistList: PackedArtist[];
  worldGeoJson: WorldGeoJson;
}

function extract(): Promise<InputLists> {
  return Promise.all([
    loadMergedArtistList(),
    loadWorldGeoJson(),
  ]).then(([mergedArtistList, worldGeoJson]) => ({
    mergedArtistList,
    worldGeoJson,
  }));
}

function transform({mergedArtistList, worldGeoJson}: InputLists): WorldGeoJson {
  const allowedAreaCodes: string[] = uniq(mergedArtistList.map(([, , code]) => code));

  return {
    type: 'FeatureCollection',
    features: worldGeoJson.features
      .filter(({properties: {iso_a2}}) => includes(iso_a2, allowedAreaCodes))
      .map(convertAreaFeature),
  };
}

function convertAreaFeature(areaGeoJson: AreaGeoJson): AreaGeoJson {
  const {type, properties, geometry} = areaGeoJson;
  const allowedProperties = [
    'name',
    'iso_a2',
  ];

  return {
    type,
    properties: pick(allowedProperties, properties),
    geometry,
  };
}

function load(worldGeoJson: WorldGeoJson): Promise<WorldGeoJson> {
  const {outputFilePath} = config.scripts.artistAreaMap.trimWorldMap;

  log();
  log(`writing to "${outputFilePath}"`);

  return writeFile(outputFilePath, worldGeoJson, 0);
}

extract()
  .then(transform)
  .then(load)
  .then(({features}) => proxyLogLength(features))
  .catch(console.error);
