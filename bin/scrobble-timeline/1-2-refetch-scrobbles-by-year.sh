rm output/scrobble-timeline/1-scrobbles/$@-01-01--$@-12-31
npm run script:scrobble-timeline:1-fetch-scrobbles $@-01-01 $@-12-31
npm run script:scrobble-timeline:2-merge-scrobbles
npm run script:scrobble-timeline:3-group-artists-by-genres
npm run script:scrobble-timeline:4-copy-output
