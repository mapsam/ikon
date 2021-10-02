'use strict';

const superagent = require('superagent');

const locations = [
  'June Mountain',
  'Mammoth Mountain',
  'Big Bear Mountain Resort',
  'Palisades Tahoe',
  'Crystal Mountain',
  'The Summit at Snoqualmie',
  'Mt. Bachelor',
  'Schweitzer',
  'Steamboat',
  'Aspen Snowmass',
  'Winter Park',
  'Copper Mountain',
  'Arapahoe Basin',
  'Eldora Mountain Resort',
  'Big Sky',
  'Jackson Hole Mountain Resort',
  'Taos',
  'Deer Valley Resort',
  'Solitude Mountain Resort',
  'Brighton Resort',
  'Alta Ski Area',
  'Snowbird',
  'Boyne Highlands',
  'Boyne Mountain',
  'Stratton',
  'Killington Resort',
  'Sugarbush Resort',
  'Snowshoe Mountain',
  'Sunday River',
  'Sugarloaf',
  'Loon Mountain',
  'Windham Mountain',
  'SkiBig3',
  'Revelstoke Mountain Resort',
  'Cypress Mountain',
  'Red Mountain',
  'Tremblant',
  'Blue Mountain'
];

(async() => {
  const baseurl = 'https://api.mapbox.com/geocoding/v5/mapbox.places';
  const token = 'pk.eyJ1IjoibWFwc2FtIiwiYSI6ImNrdWEyZWFmNDBjanAzMnE2bjQ3enV0bTgifQ.ytDjDrR0KTH6xgSmBkgDpw';

  for (const s in locations) {
    const location = locations[s];
    const { body } = await superagent.get(`${baseurl}/${location}.json?&access_token=${token}`);
    if (!body.features.length) {
      console.log(location, null, null, null);
    } else {
      console.log(`${location}, ${body.features[0].geometry.coordinates[0]}, ${body.features[0].geometry.coordinates[1]}`);
    }
  }
})();