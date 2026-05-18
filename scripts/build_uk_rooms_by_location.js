const fs = require("fs");

const inputPath = process.argv[2] || "/tmp/uk_rooms_raw.json";
const outputPath = process.argv[3] || "uk_rooms_by_location.json";
const overridesPath = process.argv[4] || "manual_room_overrides.json";
const csvOutputPath = outputPath.replace(/\.json$/i, ".csv");

const categoryLabels = {
  0: "in-person room",
  1: "company",
  2: "online room",
};

const locationLookup = {
  "Ashford": ["Kent", "England"],
  "Ashton-under-Lyne": ["Greater Manchester", "England"],
  "Basingstoke": ["Hampshire", "England"],
  "Belfast": ["County Antrim", "Northern Ireland"],
  "Beverley": ["East Riding of Yorkshire", "England"],
  "Billericay": ["Essex", "England"],
  "Birmingham": ["West Midlands", "England"],
  "Bodmin": ["Cornwall", "England"],
  "Bournemouth": ["Dorset", "England"],
  "Brighouse": ["West Yorkshire", "England"],
  "Brighton": ["East Sussex", "England"],
  "Bristol": ["Bristol", "England"],
  "Broadstairs": ["Kent", "England"],
  "Bury": ["Greater Manchester", "England"],
  "Cambridge": ["Cambridgeshire", "England"],
  "Canterbury": ["Kent", "England"],
  "Cardiff": ["Cardiff", "Wales"],
  "Chatham": ["Kent", "England"],
  "Cheltenham": ["Gloucestershire", "England"],
  "Chester": ["Cheshire", "England"],
  "Chippenham": ["Wiltshire", "England"],
  "Coalville": ["Leicestershire", "England"],
  "Colchester": ["Essex", "England"],
  "Coventry": ["West Midlands", "England"],
  "Crawley": ["West Sussex", "England"],
  "Crewe": ["Cheshire", "England"],
  "Crowborough": ["East Sussex", "England"],
  "Croydon": ["Greater London", "England"],
  "Derby": ["Derbyshire", "England"],
  "Disley": ["Cheshire", "England"],
  "Dover": ["Kent", "England"],
  "Dundee": ["Dundee City", "Scotland"],
  "Edinburgh": ["City of Edinburgh", "Scotland"],
  "Eltham": ["Greater London", "England"],
  "Epsom": ["Surrey", "England"],
  "Frittenden": ["Kent", "England"],
  "Gillingham": ["Kent", "England"],
  "Glasgow": ["Glasgow City", "Scotland"],
  "Gravesend": ["Kent", "England"],
  "Greenwich": ["Greater London", "England"],
  "Grimsby": ["Lincolnshire", "England"],
  "Guildford": ["Surrey", "England"],
  "Halifax": ["West Yorkshire", "England"],
  "Hatton": ["Warwickshire", "England"],
  "Huddersfield": ["West Yorkshire", "England"],
  "Inveraray": ["Argyll and Bute", "Scotland"],
  "Kenny Hill": ["Suffolk", "England"],
  "Kingston": ["Greater London", "England"],
  "Leeds": ["West Yorkshire", "England"],
  "Leicester": ["Leicestershire", "England"],
  "Leighton Buzzard": ["Bedfordshire", "England"],
  "Letchworth Garden City": ["Hertfordshire", "England"],
  "Liverpool": ["Merseyside", "England"],
  "Llanfyllin": ["Powys", "Wales"],
  "London": ["Greater London", "England"],
  "Loughborough": ["Leicestershire", "England"],
  "Macclesfield": ["Cheshire", "England"],
  "Maidstone": ["Kent", "England"],
  "Manchester": ["Greater Manchester", "England"],
  "Margate": ["Kent", "England"],
  "Milton Keynes": ["Buckinghamshire", "England"],
  "Newark": ["Nottinghamshire", "England"],
  "Newbury": ["Berkshire", "England"],
  "Newcastle upon Tyne": ["Tyne and Wear", "England"],
  "Norwich": ["Norfolk", "England"],
  "Nottingham": ["Nottinghamshire", "England"],
  "Paddock Wood": ["Kent", "England"],
  "Peterborough": ["Cambridgeshire", "England"],
  "Plymouth": ["Devon", "England"],
  "Pontefract": ["West Yorkshire", "England"],
  "Portsmouth": ["Hampshire", "England"],
  "Ramsgate": ["Kent", "England"],
  "Rawtenstall": ["Lancashire", "England"],
  "Reading": ["Berkshire", "England"],
  "Rushden": ["Northamptonshire", "England"],
  "Sheffield": ["South Yorkshire", "England"],
  "Shrewsbury": ["Shropshire", "England"],
  "Soham": ["Cambridgeshire", "England"],
  "Somerton": ["Somerset", "England"],
  "Southampton": ["Hampshire", "England"],
  "St Neots": ["Cambridgeshire", "England"],
  "Stafford": ["Staffordshire", "England"],
  "Sudbury": ["Suffolk", "England"],
  "Sunderland": ["Tyne and Wear", "England"],
  "Swindon": ["Wiltshire", "England"],
  "Telford": ["Shropshire", "England"],
  "Tewkesbury": ["Gloucestershire", "England"],
  "Truro": ["Cornwall", "England"],
  "Tunbridge Wells": ["Kent", "England"],
  "Wakefield": ["West Yorkshire", "England"],
  "Wallington": ["Greater London", "England"],
  "Watford": ["Hertfordshire", "England"],
  "West Wickham": ["Greater London", "England"],
  "Wetherby": ["West Yorkshire", "England"],
  "Whittlesey": ["Cambridgeshire", "England"],
  "Wigan": ["Greater Manchester", "England"],
  "Wirral": ["Merseyside", "England"],
  "Wolverhampton": ["West Midlands", "England"],
  "Worcester": ["Worcestershire", "England"],
  "Workington": ["Cumbria", "England"],
  "Worthing": ["West Sussex", "England"],
  "York": ["North Yorkshire", "England"],
};

function firestoreValue(value) {
  if (!value) return undefined;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("nullValue" in value) return null;
  if ("arrayValue" in value) return (value.arrayValue.values || []).map(firestoreValue);
  if ("mapValue" in value) {
    return Object.fromEntries(
      Object.entries(value.mapValue.fields || {}).map(([key, item]) => [key, firestoreValue(item)])
    );
  }
  return undefined;
}

function cleanDoc(result) {
  const fields = result.document.fields || {};
  const data = Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, firestoreValue(value)])
  );

  return {
    docId: result.document.name.split("/").pop(),
    name: data.name || "",
    englishName: data.englishName || "",
    displayName: data.englishName || data.name || "",
    company: data.company || "",
    link: data.link || "",
    sourceCity: data.city || "",
    sourceState: data.state || "",
    country: data.country || "",
    category: data.category,
    categoryLabel: categoryLabels[data.category] || "unknown",
    isApproved: data.isApproved || [],
    isNominee: data.isNominee || [],
    isFinalist: data.isFinalist || [],
    isWinner: data.isWinner || [],
    isConfirmedOpen: data.isConfirmedOpen || [],
    isIneligible: data.isIneligible || [],
    isPermanentlyIneligible: data.isPermanentlyIneligible || [],
    ineligibilityReason: data.ineligibilityReason || "",
    createTime: result.document.createTime,
    updateTime: result.document.updateTime,
  };
}

function cityParts(sourceCity) {
  return String(sourceCity || "")
    .split(/\s*\/\s*/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => part !== "Brisbane, Australia");
}

function sortByName(a, b) {
  return a.displayName.localeCompare(b.displayName) || a.company.localeCompare(b.company);
}

function loadOverrides(path) {
  if (!fs.existsSync(path)) return { rooms: {} };

  const data = JSON.parse(fs.readFileSync(path, "utf8"));
  if (data.rooms && typeof data.rooms !== "object") {
    throw new Error(`${path}: rooms must be an object keyed by docId`);
  }

  return {
    ...data,
    rooms: data.rooms || {},
  };
}

function isClosedOverride(override) {
  if (!override || typeof override !== "object") return false;
  return override.status === "closed" || override.closed === true || override.hidden === true;
}

function statusYears(room) {
  return [
    ...room.isApproved,
    ...room.isNominee,
    ...room.isFinalist,
    ...room.isWinner,
    ...room.isConfirmedOpen,
    ...room.isIneligible,
    ...room.isPermanentlyIneligible,
  ].filter(Number.isFinite);
}

function isClosureReason(reason) {
  return /\b(clos(?:ed|ure|ing)?|shut|ceased|retir(?:e|ed|ing)|no longer|not operating|temporary room)\b/i.test(
    reason
  );
}

function isSourceClosed(room, latestYear) {
  return isClosureReason(room.ineligibilityReason) && !room.isConfirmedOpen.includes(latestYear);
}

const raw = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const allRooms = raw.filter((item) => item.document).map(cleanDoc);
const overrides = loadOverrides(overridesPath);
const latestSourceYear = Math.max(...allRooms.flatMap(statusYears));
const closedOverrideIds = new Set(
  Object.entries(overrides.rooms)
    .filter(([, override]) => isClosedOverride(override))
    .map(([docId]) => docId)
);
const sourceClosedIds = new Set(
  allRooms
    .filter((room) => isSourceClosed(room, latestSourceYear))
    .map((room) => room.docId)
);
const closedIds = new Set([...closedOverrideIds, ...sourceClosedIds]);
const rooms = allRooms.filter((room) => !closedIds.has(room.docId));
const excludedClosedRooms = allRooms
  .filter((room) => closedIds.has(room.docId))
  .map((room) => ({
    docId: room.docId,
    displayName: room.displayName,
    company: room.company,
    sourceCity: room.sourceCity,
    ineligibilityReason: room.ineligibilityReason,
    closureSource: closedOverrideIds.has(room.docId) ? "manual" : "source",
  }))
  .sort(sortByName);
const unmatchedOverrideIds = Array.from(closedOverrideIds)
  .filter((docId) => !allRooms.some((room) => room.docId === docId))
  .sort();
const grouped = new Map();
const unresolvedLocations = new Set();

for (const room of rooms) {
  const parts = cityParts(room.sourceCity);
  const multiLocation = parts.length > 1;

  for (const city of parts) {
    const [county, constituentCountry] = locationLookup[city] || [null, null];
    if (!county) unresolvedLocations.add(city);

    const countyKey = `${constituentCountry || "Unknown"}\u0000${county || "Unknown"}\u0000${room.sourceState || ""}`;
    if (!grouped.has(countyKey)) {
      grouped.set(countyKey, {
        constituentCountry: constituentCountry || "Unknown",
        county: county || "Unknown",
        state: room.sourceState || "",
        cities: new Map(),
      });
    }

    const countyGroup = grouped.get(countyKey);
    if (!countyGroup.cities.has(city)) {
      countyGroup.cities.set(city, {
        city,
        state: room.sourceState || "",
        rooms: [],
      });
    }

    countyGroup.cities.get(city).rooms.push({
      ...room,
      city,
      county,
      constituentCountry,
      multiLocation,
    });
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  source: {
    app: "https://roomfinder.terpeca.com",
    firestoreProject: "terpeca-voter-portal",
    collection: "rooms",
    query: "country == United Kingdom",
  },
  notes: [
    "County is inferred from the city/place string because the API does not provide county or postcode.",
    "Slash-separated city fields are split, so multi-location records appear under each city and retain sourceCity.",
    "One non-UK slash-separated location, Brisbane, Australia, is omitted from UK grouping while the original sourceCity remains on the record.",
    "The API's UK records include in-person rooms, company records, and online-room records; categoryLabel preserves that distinction.",
    "Rooms with source closure/ineligibility reasons are excluded unless confirmed open in the latest source year.",
    "Rooms marked closed in manual_room_overrides.json are also excluded from grouped counts and map data.",
  ],
  totalSourceRecords: allRooms.length,
  totalVisibleSourceRecords: rooms.length,
  totalExcludedClosedRecords: excludedClosedRooms.length,
  latestSourceYear,
  totalGroupedEntries: Array.from(grouped.values()).reduce(
    (sum, countyGroup) =>
      sum + Array.from(countyGroup.cities.values()).reduce((citySum, city) => citySum + city.rooms.length, 0),
    0
  ),
  categoryCounts: rooms.reduce((counts, room) => {
    counts[room.categoryLabel] = (counts[room.categoryLabel] || 0) + 1;
    return counts;
  }, {}),
  manualOverrides: {
    path: overridesPath,
    closedRecordCount: allRooms.filter((room) => closedOverrideIds.has(room.docId)).length,
    unmatchedClosedDocIds: unmatchedOverrideIds,
  },
  sourceClosedRecordCount: allRooms.filter((room) => sourceClosedIds.has(room.docId)).length,
  excludedClosedRooms,
  unresolvedLocations: Array.from(unresolvedLocations).sort(),
  counties: Array.from(grouped.values())
    .map((countyGroup) => ({
      constituentCountry: countyGroup.constituentCountry,
      county: countyGroup.county,
      state: countyGroup.state,
      roomCount: Array.from(countyGroup.cities.values()).reduce((sum, city) => sum + city.rooms.length, 0),
      cities: Array.from(countyGroup.cities.values())
        .map((city) => ({
          ...city,
          roomCount: city.rooms.length,
          rooms: city.rooms.sort(sortByName),
        }))
        .sort((a, b) => a.city.localeCompare(b.city)),
    }))
    .sort(
      (a, b) =>
        a.constituentCountry.localeCompare(b.constituentCountry) ||
        a.county.localeCompare(b.county)
    ),
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
writeCsv(csvOutputPath, output);
console.log(`Wrote ${outputPath}`);
console.log(`Wrote ${csvOutputPath}`);
console.log(`Source records: ${output.totalSourceRecords}`);
console.log(`Visible source records: ${output.totalVisibleSourceRecords}`);
console.log(`Excluded closed records: ${output.totalExcludedClosedRecords}`);
console.log(`Grouped entries: ${output.totalGroupedEntries}`);
console.log(`Unresolved locations: ${output.unresolvedLocations.length}`);
if (unmatchedOverrideIds.length) {
  console.warn(`Closed override docIds not found in source: ${unmatchedOverrideIds.join(", ")}`);
}

function writeCsv(path, data) {
  const columns = [
    "constituentCountry",
    "county",
    "state",
    "city",
    "categoryLabel",
    "displayName",
    "name",
    "englishName",
    "company",
    "link",
    "sourceCity",
    "sourceState",
    "docId",
    "isApproved",
    "isNominee",
    "isFinalist",
    "isWinner",
    "isConfirmedOpen",
    "isIneligible",
    "isPermanentlyIneligible",
    "ineligibilityReason",
  ];

  const rows = [columns.join(",")];
  for (const county of data.counties) {
    for (const city of county.cities) {
      for (const room of city.rooms) {
        rows.push(columns.map((column) => csv(room[column] ?? city[column] ?? county[column])).join(","));
      }
    }
  }

  fs.writeFileSync(path, `${rows.join("\n")}\n`);
}

function csv(value) {
  let text = Array.isArray(value) ? value.join(";") : String(value ?? "");
  if (/[",\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}
