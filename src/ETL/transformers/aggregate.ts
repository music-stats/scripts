import {Scrobble, ScrobbleList} from 'src/types/scrobble';
import {ArtistNameCorrection} from 'src/types/correction';

// expects "scrobbleList" to contains scrobbles in chronological order
export function aggregatePlaycounts(
  scrobbleList: ScrobbleList,
  artistNameCorrection: ArtistNameCorrection,
): ScrobbleList {
  const accumulator: {[key: string]: number} = {};
  const updatePlaycountValues = (scrobble: Scrobble): Scrobble => {
    const {track, album, artist} = scrobble;
    const artistNameCorrected = artistNameCorrection[artist.name] || artist.name;

    // prefixes are added to avoid collisions,
    // e.g. same track and album names for the same artist
    const trackKey = `track: ${artistNameCorrected} - ${track.name}`;
    const albumKey = `album: ${artistNameCorrected} - ${album.name}`;
    const artistKey = `artist: ${artistNameCorrected}`;

    [trackKey, albumKey, artistKey].forEach((key) => {
      accumulator[key] = accumulator[key]
        ? accumulator[key] + 1
        : 1;
    });

    return {
      ...scrobble,
      track: {
        ...track,
        playcount: accumulator[trackKey],
      },
      album: {
        ...album,
        playcount: accumulator[albumKey],
      },
      artist: {
        name: artistNameCorrected,
        playcount: accumulator[artistKey],
      },
    };
  };

  return scrobbleList.map(updatePlaycountValues);
}
