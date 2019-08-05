import * as querystring from 'querystring';
import {times, take} from 'ramda';
import axios, {AxiosResponse} from 'axios';
import * as dotenv from 'dotenv';

import {
  LibraryResponseData,
  RecentTracksRequestSpecificParams,
  RecentTracksResponseData,
  Artist,
  RecentTrack,
} from 'src/types/lastfm';

import config from 'src/config';
import {sequence} from 'src/utils/promise';
import log, {logRequest} from 'src/utils/log';
import {retrieveResponseDataCache, storeResponseDataCache} from 'src/utils/cache';

const {parsed: {LASTFM_API_KEY}} = dotenv.config();

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

function fetchPage<ResponseData, SpecificParams>(
  method: string,
  username: string,
  pageNumber: number,
  pagesCount: number | null,
  perPage: number,
  toBypassCache: boolean,
  specificParams?: SpecificParams,
): Promise<ResponseData> {
  const url = buildApiUrl(
    method,
    {
      user: username,
      limit: perPage,
      page: pageNumber + 1, // bounds: 1-1000000
      ...specificParams,
    },
  );
  const headers = {
    'User-Agent': config.userAgent,
  };

  function requestLastfmLibrary(): Promise<AxiosResponse<ResponseData>> {
    logRequest(url);
    return axios.get(url, {headers});
  }

  function retrieveLastfmLibraryCache(): Promise<ResponseData> {
    return retrieveResponseDataCache<ResponseData>(url, config.connectors.lastfm.cache);
  }

  function storeLastfmLibraryCache(response: AxiosResponse<ResponseData>): Promise<AxiosResponse<ResponseData>> {
    return storeResponseDataCache<ResponseData>(url, response.data, config.connectors.lastfm.cache)
      .then(() => response);
  }

  if (toBypassCache) {
    return requestLastfmLibrary()
      .then((response) => response.data);
  }

  log();
  log(`fetching last.fm "${method}" page #${pageNumber + 1}/${pagesCount || '?'}`);

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

function concatLibraryArtistsPages(pagesData: LibraryResponseData[]): Artist[] {
  return pagesData.reduce(
    (rawArtistList: Artist[], pageData) => rawArtistList.concat(pageData.artists.artist),
    [],
  );
}

function concatRecentTracksPages(pagesData: RecentTracksResponseData[]): RecentTrack[] {
  return pagesData.reduce(
    (rawRecentTrackList: RecentTrack[], pageData) => rawRecentTrackList.concat(pageData.recenttracks.track),
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
    (pageNumber) => fetchPage.bind(
      null,
      'library.getartists',
      username,
      pageNumber,
      pagesCount,
      perPage,
      toBypassCache,
    ),
    pagesCount,
  );
  const cutExtraArtists = (rawArtistList: Artist[]) => take(artistsCount, rawArtistList);

  log(`pages: ${pagesCount}`);

  return sequence(fetchAllPages)
    .then(concatLibraryArtistsPages)
    .then(cutExtraArtists);
}

export function fetchRecentTracks(
  username: string,
  from: number,
  to: number,
  toBypassCache: boolean,
): Promise<RecentTrack[]> {
  const {perPage, maxPageNumber} = config.connectors.lastfm.recentTracks;
  const dateRange = {
    from,
    to,
  } as RecentTracksRequestSpecificParams;
  const fetchFirstPage = fetchPage.bind<null, any, Promise<RecentTracksResponseData>>(
    null,
    'user.getrecenttracks',
    username,
    0,
    null, // at this point, the "pagesCount" value is unknown
    perPage,
    toBypassCache,
    dateRange,
  );
  const fetchRemainingPages = (firstPageData: RecentTracksResponseData) => {
    const pagesCount = Math.min(
      parseInt(firstPageData.recenttracks['@attr'].totalPages, 10),
      maxPageNumber,
    );
    const allPages = [
      firstPageData,
    ];

    if (pagesCount < 2) {
      return Promise.resolve(allPages);
    }

    return sequence(times(
      (pageNumber) => fetchPage.bind<null, any, Promise<RecentTracksResponseData>>(
        null,
        'user.getrecenttracks',
        username,
        pageNumber + 1,
        pagesCount,
        perPage,
        toBypassCache,
        dateRange,
      ),
      pagesCount - 1,
    ))
      .then((remainingPages) => allPages.concat(remainingPages));
  };

  return fetchFirstPage()
    .then(fetchRemainingPages)
    .then(concatRecentTracksPages);
}
