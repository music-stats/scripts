import {ScrobbleList} from 'src/types/scrobble';

import config from 'src/config';
import {readAllJsonFiles, writeFile} from 'src/utils/file';
import log, {proxyLogLength} from 'src/utils/log';
import {aggregatePlaycounts} from 'src/ETL/transformers/aggregate';
import merge from 'src/ETL/transformers/merge-scrobbles';

function extract(): Promise<ScrobbleList[]> {
  return readAllJsonFiles<ScrobbleList>(config.scripts.scrobbleTimeline.fetchScrobbles.outputFilePath);
}

function transform(scrobbleListList: ScrobbleList[]): ScrobbleList {
  return aggregatePlaycounts(merge(scrobbleListList));
}

function load(scrobbleList: ScrobbleList): Promise<ScrobbleList> {
  const {outputFilePath} = config.scripts.scrobbleTimeline.mergeScrobbles;

  log();
  log(`writing to "${outputFilePath}"`);

  return writeFile(outputFilePath, scrobbleList);
}

extract()
  .then(transform)
  .then(load)
  .then(proxyLogLength)
  .catch(console.error);
