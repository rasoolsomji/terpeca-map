const fs = require("fs");

const inputPath = process.argv[2] || "uk_rooms_by_location.json";
const outputPath = process.argv[3] || "uk_rooms_map_data.js";

const cityCoordinates = {
  Ashford: [51.1465, 0.875],
  "Ashton-under-Lyne": [53.4897, -2.0952],
  Basingstoke: [51.2665, -1.0924],
  Belfast: [54.5973, -5.9301],
  Beverley: [53.8459, -0.425],
  Billericay: [51.6287, 0.4196],
  Birmingham: [52.4862, -1.8904],
  Bodmin: [50.4715, -4.718],
  Bournemouth: [50.7192, -1.8808],
  Brighouse: [53.7034, -1.7849],
  Brighton: [50.8225, -0.1372],
  Bristol: [51.4545, -2.5879],
  Broadstairs: [51.3588, 1.4394],
  Bury: [53.5933, -2.2966],
  Cambridge: [52.2053, 0.1218],
  Canterbury: [51.2802, 1.0789],
  Cardiff: [51.4816, -3.1791],
  Chatham: [51.3807, 0.5227],
  Cheltenham: [51.8994, -2.0783],
  Chester: [53.1934, -2.8931],
  Chippenham: [51.4615, -2.1195],
  Coalville: [52.7229, -1.3704],
  Colchester: [51.8959, 0.8919],
  Coventry: [52.4068, -1.5197],
  Crawley: [51.1091, -0.1872],
  Crewe: [53.1004, -2.4438],
  Crowborough: [51.0609, 0.1617],
  Croydon: [51.3762, -0.0982],
  Derby: [52.9225, -1.4746],
  Disley: [53.3585, -2.0387],
  Dover: [51.1279, 1.3134],
  Dundee: [56.462, -2.9707],
  Edinburgh: [55.9533, -3.1883],
  Eltham: [51.4514, 0.0521],
  Epsom: [51.3362, -0.2674],
  Frittenden: [51.139, 0.5908],
  Gillingham: [51.3863, 0.5514],
  Glasgow: [55.8642, -4.2518],
  Gravesend: [51.4419, 0.3708],
  Greenwich: [51.4826, -0.0077],
  Grimsby: [53.5675, -0.0808],
  Guildford: [51.2362, -0.5704],
  Halifax: [53.727, -1.8575],
  Hatton: [52.2973, -1.6466],
  Huddersfield: [53.6458, -1.785],
  Inveraray: [56.2303, -5.0747],
  "Kenny Hill": [52.382, 0.486],
  Kingston: [51.4123, -0.3007],
  Leeds: [53.8008, -1.5491],
  Leicester: [52.6369, -1.1398],
  "Leighton Buzzard": [51.9179, -0.6607],
  "Letchworth Garden City": [51.9794, -0.2266],
  Liverpool: [53.4084, -2.9916],
  Llanfyllin: [52.765, -3.273],
  London: [51.5074, -0.1278],
  Loughborough: [52.7721, -1.2062],
  Macclesfield: [53.2587, -2.1193],
  Maidstone: [51.2704, 0.5227],
  Manchester: [53.4808, -2.2426],
  Margate: [51.3896, 1.3862],
  "Milton Keynes": [52.0406, -0.7594],
  Newark: [53.076, -0.809],
  Newbury: [51.4014, -1.3231],
  "Newcastle upon Tyne": [54.9783, -1.6178],
  Norwich: [52.6309, 1.2974],
  Nottingham: [52.9548, -1.1581],
  "Paddock Wood": [51.1817, 0.3898],
  Peterborough: [52.5695, -0.2405],
  Plymouth: [50.3755, -4.1427],
  Pontefract: [53.6911, -1.3127],
  Portsmouth: [50.8198, -1.088],
  Ramsgate: [51.335, 1.416],
  Rawtenstall: [53.7008, -2.2875],
  Reading: [51.4543, -0.9781],
  Rushden: [52.2892, -0.6017],
  Sheffield: [53.3811, -1.4701],
  Shrewsbury: [52.7073, -2.7553],
  Soham: [52.3352, 0.3368],
  Somerton: [51.0543, -2.7359],
  Southampton: [50.9097, -1.4044],
  "St Neots": [52.2281, -0.2686],
  Stafford: [52.8067, -2.1171],
  Sudbury: [52.0389, 0.7312],
  Sunderland: [54.9069, -1.3838],
  Swindon: [51.5558, -1.7797],
  Telford: [52.6784, -2.4453],
  Tewkesbury: [51.9924, -2.1585],
  Truro: [50.2632, -5.051],
  "Tunbridge Wells": [51.1324, 0.2637],
  Wakefield: [53.6833, -1.4977],
  Wallington: [51.3586, -0.1499],
  Watford: [51.6565, -0.3903],
  "West Wickham": [51.3767, -0.0199],
  Wetherby: [53.9286, -1.3869],
  Whittlesey: [52.558, -0.13],
  Wigan: [53.5451, -2.6325],
  Wirral: [53.3727, -3.0738],
  Wolverhampton: [52.5862, -2.1287],
  Worcester: [52.1936, -2.2216],
  Workington: [54.6436, -3.5441],
  Worthing: [50.8179, -0.3729],
  York: [53.959, -1.0815],
};

const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));

const cities = [];
const missingCoordinates = [];

for (const county of data.counties || []) {
  for (const city of county.cities || []) {
    const coordinates = cityCoordinates[city.city];
    if (!coordinates) {
      missingCoordinates.push(city.city);
      continue;
    }

    const rooms = city.rooms.map((room) => ({
      docId: room.docId,
      displayName: room.displayName,
      company: room.company,
      link: room.link,
      categoryLabel: room.categoryLabel,
      sourceCity: room.sourceCity,
      multiLocation: Boolean(room.multiLocation),
      isApproved: room.isApproved || [],
      isNominee: room.isNominee || [],
      isFinalist: room.isFinalist || [],
      isWinner: room.isWinner || [],
    }));

    cities.push({
      id: `${county.constituentCountry}:${county.county}:${city.city}`,
      city: city.city,
      county: county.county,
      constituentCountry: county.constituentCountry,
      lat: coordinates[0],
      lon: coordinates[1],
      roomCount: city.roomCount,
      rooms,
    });
  }
}

if (missingCoordinates.length) {
  throw new Error(`Missing map coordinates for: ${missingCoordinates.sort().join(", ")}`);
}

const mapData = {
  generatedAt: new Date().toISOString(),
  sourceGeneratedAt: data.generatedAt,
  source: data.source,
  notes: [
    "Coordinates are approximate city/place centroids, intended for a visual overview rather than venue-level navigation.",
    "Markers are grouped at city/place level because the source data does not include venue addresses or postcodes.",
  ],
  totalCities: cities.length,
  totalRooms: cities.reduce((sum, city) => sum + city.roomCount, 0),
  totalExcludedClosedRecords: data.totalExcludedClosedRecords || 0,
  sourceClosedRecordCount: data.sourceClosedRecordCount || 0,
  manualOverrides: data.manualOverrides || { closedRecordCount: 0, unmatchedClosedDocIds: [] },
  cities: cities.sort((a, b) => b.roomCount - a.roomCount || a.city.localeCompare(b.city)),
};

fs.writeFileSync(
  outputPath,
  `window.UK_ROOM_MAP_DATA = ${JSON.stringify(mapData, null, 2)};\n`
);

console.log(`Wrote ${outputPath}`);
console.log(`Cities: ${mapData.totalCities}`);
console.log(`Grouped room entries: ${mapData.totalRooms}`);
