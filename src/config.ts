import * as path from 'path';

import Config, {CorrectionDataType} from 'src/types/config';

const rootDir = path.resolve(__dirname, '../../');
const correctionsDir = path.resolve(rootDir, 'data/corrections/');
const datasetsDir = path.resolve(rootDir, 'data/datasets/');
const cacheDir = path.resolve(rootDir, 'cache/');
const outputDir = path.resolve(rootDir, 'output/');
const artistAreaMapScriptOutputDir = path.resolve(outputDir, 'artist-area-map/');
const scrobbleTimelineScriptOutputDir = path.resolve(outputDir, 'scrobble-timeline/');

const config: Config = {
  userAgent: 'music-stats/0.0.0 (https://github.com/music-stats/scripts/)',

  connectors: {
    lastfm: {
      api: {
        root: 'https://ws.audioscrobbler.com/2.0',
      },
      username: 'markhovskiy',
      artists: {
        maxPageNumber: 10, // @see: https://www.last.fm/api/tos
        perPage: 200,
        countDefault: 50,
      },
      recentTracks: {
        maxPageNumber: 100,
        perPage: 200,
      },
      cache: {
        ttl: 60 * 60 * 1000, // 1 hour
        dir: path.resolve(cacheDir, 'lastfm/'),
      },
    },

    musicbrainz: {
      api: {
        root: 'https://musicbrainz.org/ws/2',

        // In theory, MUST be less than 50 requests per second.
        // @see: https://wiki.musicbrainz.org/XML_Web_Service/Rate_Limiting
        requestFrequency: 600,
      },
      artists: {
        countDefault: 10,
      },
      cache: {
        ttl: 365 * 24 * 60 * 60 * 1000, // 1 year
        dir: path.resolve(cacheDir, 'musicbrainz/'),
      },
    },
  },

  scripts: {
    artistAreaMap: {
      fetchArtist: {
        outputFilePath: path.resolve(artistAreaMapScriptOutputDir, '1-lastfm-user-library.json'),
      },

      fetchArtistsAreas: {
        outputFilePath: path.resolve(artistAreaMapScriptOutputDir, '2-musicbrainz-artists-areas.json'),
      },

      mergeArtists: {
        corrections: {
          artistName: {
            dataType: CorrectionDataType.JsonFile,
            filePath: path.resolve(correctionsDir, '1-artist-name.json'),
          },
          artistArea: {
            dataType: CorrectionDataType.TxtFolder,
            filePath: path.resolve(correctionsDir, '2-artist-area/'),
          },
          area: {
            dataType: CorrectionDataType.TxtFolder,
            filePath: path.resolve(correctionsDir, '3-area/'),
          },
        },

        outputFilePath: path.resolve(artistAreaMapScriptOutputDir, '3-merged-artists.json'),
      },
    },

    scrobbleTimeline: {
      fetchScrobbles: {
        outputFilePath: path.resolve(scrobbleTimelineScriptOutputDir, '1-scrobbles/', '<from>--<to>.json'),
      },

      mergeScrobbles: {
        outputFilePath: path.resolve(scrobbleTimelineScriptOutputDir, '2-merged-scrobbles.json'),
      },
    },
  },

  datasets: {
    countryCodes: {
      filePath: path.resolve(datasetsDir, 'country-codes-iso-3166-1-alpha-2.json'),
    }
  },
};

export default config;
