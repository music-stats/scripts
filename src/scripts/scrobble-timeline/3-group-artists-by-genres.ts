import {ArtistListByGenre} from 'src/types/artist';

import config from 'src/config';
import {writeFile, TxtMultilineFolderContent} from 'src/utils/file';
import log from 'src/utils/log';
import {loadArtistListByGenreDataset} from 'src/ETL/extractors/dataset';

function extract(): Promise<TxtMultilineFolderContent> {
  return loadArtistListByGenreDataset();
}

function transform(artistListByFilename: TxtMultilineFolderContent): ArtistListByGenre {
  const artistListByGenre: ArtistListByGenre = {};
  const upperCaseFirstLetter = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);
  const filenameToGenre = (filename: string) => filename.split('--').map(upperCaseFirstLetter).join(' ');

  for (const filename in artistListByFilename) {
    const artistList = artistListByFilename[filename].filter((artist) => artist.length);

    if (artistList.length) {
      artistListByGenre[filenameToGenre(filename)] = artistList;
    }
  }

  return artistListByGenre;
}

function load(artistListByGenre: ArtistListByGenre): Promise<ArtistListByGenre> {
  const {outputFilePath} = config.scripts.scrobbleTimeline.groupArtistsByGenres;

  log();
  log(`writing to "${outputFilePath}"`);

  return writeFile(outputFilePath, artistListByGenre, 0);
}

extract()
  .then(transform)
  .then(load)
  .catch(console.error);
