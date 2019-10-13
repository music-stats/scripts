export interface ConnectorCache {
  ttl: number; // ms
  dir: string;
}

interface Connector {
  api: {
    root: string;
    requestFrequency?: number; // ms
  };

  cache: ConnectorCache;
}

interface Lastfm extends Connector {
  username: string;

  artists: {
    maxPageNumber: number;
    perPage: number;
    countDefault: number;
  };

  recentTracks: {
    maxPageNumber: number;
    perPage: number;
  };
}

interface Musicbrainz extends Connector {
  artists: {
    countDefault: number;
  };
}

export enum CorrectionDataType {
  JsonFile = 'JsonFile',
  TxtFolder = 'TxtFolder',
}

export interface Correction {
  dataType: CorrectionDataType;
  filePath: string;
}

interface Script {
  outputFilePath: string;
}

interface MergeArtistsScript extends Script {
  corrections: {
    artistName: Correction;
    artistArea: Correction;
    area: Correction;
  };
}

interface Dataset {
  filePath: string;
}

export default interface Config {
  userAgent: string;

  connectors: {
    lastfm: Lastfm;
    musicbrainz: Musicbrainz;
  };

  scripts: {
    artistAreaMap: {
      fetchArtist: Script;
      fetchArtistsAreas: Script;
      mergeArtists: MergeArtistsScript;
    };

    scrobbleTimeline: {
      fetchScrobbles: Script;
      mergeScrobbles: Script;
    };
  };

  datasets: {
    countryCodes: Dataset;
  };
}
