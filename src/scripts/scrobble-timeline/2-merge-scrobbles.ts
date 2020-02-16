import {CompressedScrobbleList} from 'src/types/scrobble';

import config from 'src/config';
import {readAllJsonFiles, writeFile} from 'src/utils/file';
import log, {proxyLogLength} from 'src/utils/log';

import {loadCorrection} from 'src/ETL/extractors/correction';
import {compress, uncompress} from 'src/ETL/transformers/compress';
import {aggregatePlaycounts} from 'src/ETL/transformers/aggregate';
import merge from 'src/ETL/transformers/merge-scrobbles';

function extract(): Promise<CompressedScrobbleList[]> {
  return readAllJsonFiles<CompressedScrobbleList>(config.scripts.scrobbleTimeline.fetchScrobbles.outputFilePath);
}

function transform(compressedScrobbleListList: CompressedScrobbleList[]): Promise<CompressedScrobbleList> {
  return loadCorrection(config.scripts.scrobbleTimeline.fetchScrobbles.corrections.artistName)
    .then((artistNameCorrection) => aggregatePlaycounts(
      merge(compressedScrobbleListList.map(
        (compressedScrobbleList) => compressedScrobbleList.map(uncompress),
      )),
      artistNameCorrection,
    ))
    .then((scrobbleList) => scrobbleList.map(compress));
}

function load(compressedScrobbleList: CompressedScrobbleList): Promise<CompressedScrobbleList> {
  const {outputFilePath} = config.scripts.scrobbleTimeline.mergeScrobbles;

  log();
  log(`writing to "${outputFilePath}"`);

  return writeFile(outputFilePath, compressedScrobbleList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLogLength)
  .catch(console.error);
