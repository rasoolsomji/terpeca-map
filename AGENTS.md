# AGENTS.md

## Project Notes

- This is a static TERPECA UK rooms map. `map.html` loads Leaflet from a CDN and reads generated data from `uk_rooms_map_data.js`.
- The data pipeline is:
  1. `/tmp/uk_rooms_raw.json` plus `manual_room_overrides.json`
  2. `scripts/build_uk_rooms_by_location.js`
  3. `uk_rooms_by_location.json` and `uk_rooms_by_location.csv`
  4. `scripts/build_uk_rooms_map_data.js`
  5. `uk_rooms_map_data.js`
- The build automatically hides source records whose `ineligibilityReason` indicates closure/retirement unless they are confirmed open in the latest source year.
- Extra manual closure corrections belong in `manual_room_overrides.json`, keyed by room `docId`. Use `"status": "closed"` to hide a record from regenerated map data.
- Prefer small, static changes. There is no package install or app build step.

## Useful Commands

```bash
node scripts/build_uk_rooms_by_location.js
node scripts/build_uk_rooms_map_data.js
```

Open `map.html` directly in a browser for local viewing.
