# Unofficial TERPECA UK Rooms Map

This is an unofficial city-level map of UK rooms listed in the TERPECA 2025 data.

The data comes from TERPECA's public materials, especially:

- [TERPECA 2025](https://terpeca.com/2025/)
- [TERPECA Room Finder](https://roomfinder.terpeca.com/)

Huge thanks and appreciation to TERPECA, its organizers, voters, nominators, volunteers, and participating escape room companies. TERPECA is an extraordinary community project, and this repository is only a small fan-made visualization of a subset of their published information.

This project is not affiliated with, endorsed by, sponsored by, or maintained by TERPECA. No TERPECA logos or brand assets are included here. If TERPECA would prefer changes, clearer attribution, or removal, that should take priority.

## What This Is

- A static Leaflet/OpenStreetMap page.
- One marker per UK city/place, not one marker per venue.
- Approximate latitude/longitude based on city or place centroids.
- A simple way to browse rooms by city, category, and award status.

## What This Is Not

- It is not an official TERPECA product.
- It is not a venue-level map.
- It is not a substitute for TERPECA's own site, Room Finder, rankings, or announcements.
- It is not guaranteed to be complete or current.

## Local Use

Open [map.html](map.html) in a browser.

The page loads `uk_rooms_map_data.js` from this repository and Leaflet/OpenStreetMap assets from public CDNs.

## Regenerating Map Data

If `uk_rooms_by_location.json` changes, regenerate the map data with:

```bash
node scripts/build_uk_rooms_map_data.js
```

The generated file is:

```text
uk_rooms_map_data.js
```

## Publishing

For GitHub Pages, this repository includes:

- `index.html`, which redirects to `map.html`
- `.nojekyll`, to keep GitHub Pages from applying Jekyll processing
- static HTML/JS only, with no build step required

The published page should retain the visible TERPECA attribution and unofficial disclaimer.
