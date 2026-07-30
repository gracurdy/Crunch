# Our Atlas — mobile-first travel log starter

A dependency-free front-end prototype inspired by the supplied travel app references.

## Open it

Double-click `index.html`, or run a simple local server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Included

- Mobile-first responsive design
- Family-facing home page
- Trip cards and trip detail modal
- Search by destination, notes, or date
- Interactive stylized world map with clickable pins and zoom controls
- Combined photo gallery
- Admin page for adding trips, notes, dates, coordinates, cover images, and photo uploads
- Local browser persistence via `localStorage`

## Important prototype limitation

The admin page stores data only in the browser currently being used. It is not a secure or shared backend. Before deployment, replace the localStorage functions in `app.js` with Supabase or Firebase.

## Suggested Supabase tables

### trips
- id (uuid)
- title
- country
- city
- start_date
- end_date
- latitude
- longitude
- summary
- notes
- cover_url
- featured
- created_at

### photos
- id (uuid)
- trip_id (foreign key)
- storage_path
- caption
- taken_at
- latitude
- longitude
- sort_order

### places
- id (uuid)
- trip_id
- name
- google_place_id
- category
- latitude
- longitude
- notes
- rating

## Best next Cursor upgrades

1. Convert to React or Next.js.
2. Add Supabase Auth so only Grace and invited editors can change content.
3. Use Supabase Storage for original photos and thumbnails.
4. Replace the stylized SVG map with Mapbox, MapLibre, or Google Maps.
5. Read EXIF coordinates and capture dates from uploaded photos.
6. Add country polygons that highlight automatically based on trip coordinates.
7. Add public/private visibility per trip.
8. Add shareable trip URLs and optional family access code.
