# BoliVibes locations intake

Use this folder for human-curated place files before they are promoted into `../data/places.json` and D1. One file per place keeps research easy to review.

Required fields for every place:

```json
{
  "id": "slug",
  "name": "Place name",
  "layer": "attraction | eat_drink | tour | transfer | street_zone | event",
  "category": "Bar / café / tour / landmark",
  "description": "Short BoliVibes guide copy",
  "address": "Human-readable address",
  "google_maps_url": "https://www.google.com/maps/...",
  "website_url": null,
  "phone": null,
  "price": null,
  "source": "manual",
  "verified": false
}
```

Promotion checklist:

1. Add or update the place in `../data/places.json`.
2. Add an editorial row in `../data/santa-cruz-directory.md`.
3. If it should appear immediately in production, add coordinates and mark it verified from `/admin/places`.
4. Keep the Google Maps URL because BoliVibes shares that URL to WhatsApp, Instagram and clipboard.
