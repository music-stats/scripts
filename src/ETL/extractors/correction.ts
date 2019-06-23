import {Correction, CorrectionDataType} from 'src/types/config';
import {ParsedCorrections, AnyParsedCorrection, ParsedCorrectionsList} from 'src/types/correction';

import config from 'src/config';
import {readJsonFile, readTxtMultilineFolder, TxtMultilineFolderContent} from 'src/utils/file';

function upperCaseFirstLetter(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

// Converts "united-states" to "United States".
function convertFileBaseNameToArea(fileName: string): string {
  return fileName.split('-').map(upperCaseFirstLetter).join(' ');
}

function convertTxtMultilineFolderContentToCorrection(folderContent: TxtMultilineFolderContent): AnyParsedCorrection {
  const correction: AnyParsedCorrection = {};

  Object.entries(folderContent).forEach(([fileName, fileContent]) => {
    const area = convertFileBaseNameToArea(fileName);

    fileContent.forEach((fileString) => correction[fileString] = area);
  });

  return correction;
}

function loadCorrection({dataType, filePath}: Correction): Promise<AnyParsedCorrection> {
  if (dataType === CorrectionDataType.JsonFile) {
    return readJsonFile(filePath);
  }

  if (dataType === CorrectionDataType.TxtFolder) {
    return readTxtMultilineFolder(filePath)
      .then(convertTxtMultilineFolderContentToCorrection);
  }

  return Promise.reject('Data type is not supported');
}

export function loadAllCorrections(): Promise<ParsedCorrections> {
  const {artistName, artistArea, area} = config.scripts.artistAreaMap.mergeArtists.corrections;

  return Promise.all([
    artistName,
    artistArea,
    area,
  ].map(loadCorrection))
    .then(([artistNameCorrection, artistAreaCorrection, areaCorrection]: ParsedCorrectionsList) => ({
      artistNameCorrection,
      artistAreaCorrection,
      areaCorrection,
    }));
}
