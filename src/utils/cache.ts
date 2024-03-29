import * as fs from 'fs';
import * as path from 'path';

import {ConnectorCache as ConnectorCacheConfig} from 'src/types/config';
import {readJsonFile, writeFile} from 'src/utils/file';
import log from 'src/utils/log';

function constructCacheFilePath(dir: string, url: string, format = 'json'): string {
  return path.resolve(dir, `${encodeURIComponent(url)}.${format}`);
}

export function retrieveResponseDataCache<ResponseData>(
  url: string,
  connectorCacheConfig: ConnectorCacheConfig,
): Promise<ResponseData | null> {
  const filePath = constructCacheFilePath(connectorCacheConfig.dir, url);

  return new Promise((resolve, reject) => {
    fs.stat(filePath, (err, stats) => {
      if (err) {
        if (err.code === 'ENOENT') {
          log(`
            response is not cached, file not found:
            - file: ${filePath}
          `);
          resolve(null);
          return;
        }

        reject(err);
        return;
      }

      if (Date.now() - stats.mtimeMs > connectorCacheConfig.ttl) {
        log(`
          response cache is outdated:
          - file: ${filePath}
          - mtime: ${stats.mtime.toString()}
          - ttl: ${connectorCacheConfig.ttl}ms
        `);
        resolve(null);
        return;
      }

      log(`
        response cache is valid:
        - file: ${filePath}
      `);
      readJsonFile(filePath)
        .then(resolve)
        .catch(reject);
    });
  });
}

export function storeResponseDataCache<ResponseData>(
  url: string,
  responseData: ResponseData,
  connectorCacheConfig: ConnectorCacheConfig,
): Promise<string> {
  const filePath = constructCacheFilePath(connectorCacheConfig.dir, url);

  return writeFile(filePath, responseData)
    .then(() => log(`
      response cache is stored:
      - file: ${filePath}
    `))
    .then(() => filePath);
}
