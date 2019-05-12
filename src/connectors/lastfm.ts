import * as querystring from 'querystring';
import {times, take} from 'ramda';
import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv';

import {
  LibraryResponseData,
  // RecentTracksResponseData,
  Artist,
  RecentTrack,
} from 'src/types/lastfm';

import config from 'src/config';
import {sequence} from 'src/utils/promise';
import log, {logRequest} from 'src/utils/log';
import {retrieveResponseDataCache, storeResponseDataCache} from 'src/utils/cache';

const {parsed: {LASTFM_API_KEY}} = dotenv.config();

type LibraryResponse = AxiosResponse<LibraryResponseData>;
// type RecentTracksResponse = AxiosResponse<RecentTracksResponseData>;

export function buildApiUrl(method: string, params = {}): string {
  const defaultParams = {
    method,
    api_key: LASTFM_API_KEY,
    format: 'json',
  };

  return `${config.connectors.lastfm.api.root}?${querystring.stringify({
    ...defaultParams,
    ...params,
  })}`;
}

function fetchPage(
  username: string,
  pageNumber: number,
  pagesCount: number,
  toBypassCache: boolean,
): Promise<LibraryResponseData> {
  const url = buildApiUrl(
    'library.getartists',
    {
      user: username,
      page: pageNumber + 1, // bounds: 1-1000000
    },
  );
  const headers = {
    'User-Agent': config.userAgent,
  };

  function requestLastfmLibrary(): Promise<LibraryResponse> {
    logRequest(url);
    return axios.get(url, {headers});
  }

  function retrieveLastfmLibraryCache(): Promise<LibraryResponseData> {
    return retrieveResponseDataCache<LibraryResponseData>(url, config.connectors.lastfm.cache);
  }

  function storeLastfmLibraryCache(response: LibraryResponse): Promise<LibraryResponse> {
    return storeResponseDataCache<LibraryResponseData>(url, response.data, config.connectors.lastfm.cache)
      .then(() => response);
  }

  if (toBypassCache) {
    return requestLastfmLibrary()
      .then((response) => response.data);
  }

  log();
  log(`fetching last.fm page #${pageNumber + 1}/${pagesCount}`);

  return retrieveLastfmLibraryCache()
    .then((libraryCache) => {
      if (libraryCache) {
        return libraryCache;
      }

      return requestLastfmLibrary()
        .then(storeLastfmLibraryCache)
        .then((response) => response.data);
    });
}

function concatPages(pagesData: LibraryResponseData[]): Artist[] {
  return pagesData.reduce(
    (rawArtistList: Artist[], pageData) => rawArtistList.concat(pageData.artists.artist),
    [],
  );
}

export function fetchLibraryArtists(
  username: string,
  artistsCount: number,
  toBypassCache: boolean,
): Promise<Artist[]> {
  const {perPage, maxPageNumber} = config.connectors.lastfm.artists;
  const pagesCount = Math.min(
    Math.ceil(artistsCount / perPage),
    maxPageNumber,
  );
  const fetchAllPages = times(
    (pageNumber) => fetchPage.bind(null, username, pageNumber, pagesCount, toBypassCache),
    pagesCount,
  );
  const cutExtraArtists = (rawArtistList: Artist[]) => take(artistsCount, rawArtistList);

  log(`pages: ${pagesCount}`);

  return sequence(fetchAllPages)
    .then(concatPages)
    .then(cutExtraArtists);
}

export function fetchRecentTracks(
  username: string,
  from: string,
  to: string,
  toBypassCache: boolean,
): Promise<RecentTrack[]> {
  // http://ws.audioscrobbler.com/2.0/?
  //   method=user.getrecenttracks&
  //   api_key=33650ee56ab71aee770161885f83054c&
  //   format=json&
  //   user=markhovskiy&
  //   from=1263737600&
  //   to=1283636200&
  //   limit=200&
  //   page=4

  console.log(username, from, to, toBypassCache);
  return Promise.resolve([]);
}
