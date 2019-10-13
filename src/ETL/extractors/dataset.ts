import {CountryCodeDataset} from 'src/types/dataset';
import config from 'src/config';
import {readJsonFile} from 'src/utils/file';

export function loadCountryCodeDataset(): Promise<CountryCodeDataset> {
  return readJsonFile(config.datasets.countryCodes.filePath);
}
