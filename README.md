# ihona-frontend

Nuxt 4 (SSR) storefront for [ihona.tj](https://ihona.tj) — real estate and tourist-rental
listings across Tajikistan. Consumes the `ihona` Laravel host's REST API; see that repo's
`CLAUDE.md` ("Nuxt 3 Frontend" section) for the boundary/contract between the two repositories.
Deployed on the same VPS as the Laravel host, behind nginx, as a `systemd --user` service
(`ihona-frontend.service`) — nginx routes Laravel's own paths (`/admin`, `/app`, `/api`, `/login`,
etc.) to PHP-FPM and falls through to this app (`127.0.0.1:3000`) for everything else.

Design reference: search/listing pages follow cian.ru's layout (filter sidebar + result list);
the property detail page is intentionally simpler, closer to the local competitor aura.tj, with
no metro/transit field — Tajikistan has no metro.

## Stack

- Nuxt 4 (srcDir `app/`), Vue 3 Composition API, TypeScript, SSR on
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Pinia — `stores/auth.ts` (Bearer token, restored from localStorage by
  `plugins/auth.client.ts`), `stores/theme.ts` (light/dark)
- `@nuxtjs/i18n` — `ru` (default, unprefixed), `tg`, `uz`, `en` (prefixed)
- Yandex Maps JS API v3, loaded client-side only (`components/PropertyMap.vue`)
- Auth: Sanctum Bearer tokens via `POST /v1/auth/token` (`identity-core-api` module on the
  host) — not SPA cookie auth. **Login/register live at `/account/login` and
  `/account/register`**, not `/login`/`/register` — nginx routes those two paths to Laravel's
  own Fortify login (the real, working `/admin` and `/app` panel auth), so the frontend's
  pages would be unreachable at the same paths.

## What's real vs. what's still a stopgap

The host's public real-estate API now exists and is wired up for real:

- `GET /v1/public/territories` and `GET/GET :id /v1/public/properties` — anonymous, no auth.
  `useTerritories()` / `useProperties()` / `usePropertyById()` call these unconditionally and
  only fall back to `data/mockProperties.ts` / `data/territories.ts` if the API is unreachable,
  not merely because the visitor is anonymous.
- `POST /v1/auth/token` / `DELETE /v1/auth/token` (`identity-core-api`) — real login/logout.
- `POST /v1/real-estate/viewings` (authenticated) — the property detail page's "Contact agent"
  button opens a real date/time form and books a real viewing when logged in.

Still stopgaps:

- **Regional fields are absent from live data.** `has_generator`/`has_wifi`/`has_parking`/
  `mountain_view`/`altitude`/`water_source`/`max_guests` are not columns on
  `real_estate_properties` on the host (a known, out-of-scope schema-drift bug — the Filament
  admin form still renders fields for them regardless). Live-API properties always render these
  as absent; only the handful of remaining `mockProperties.ts` entries still show them.
- **No territory geocoding/i18n on the host.** `real_estate_territories` has no lat/lng or
  per-locale name columns, so `useTerritories()` merges the live `id`/`name`/`code` onto the
  static `data/territories.ts` entries (matched by `code`) for `slug`/`nameRu`/`lat`/`lng`.
- **`pages/account/register.vue`** is UI-only — no registration endpoint is designed on the host
  yet.
- **`PropertyMap.vue`** needs `NUXT_PUBLIC_YANDEX_MAPS_API_KEY` — without it, it renders a plain
  placeholder instead of a broken map.
- The 5 properties currently in the database are seeded test data
  (`database/seeders/PropertySeeder.php` on the host), titled `[TEST] ...` — delete via
  `/admin` once real listings exist.

## Deferred to a follow-up pass (not in this build)

- Yandex Maps marker **clustering** (`@yandex/ymaps3-clusterer`) — currently one plain marker
  per point, fine at today's listing counts
- PWA (`@vite-pwa/nuxt`), offline mode / image caching for mountain areas with poor connectivity
- `@nuxtjs/sitemap`
- Autocomplete-driven search suggestions beyond the territory-name matcher already in `SearchBar`
- Infinite scroll / pagination on `/properties` (the public API paginates; the frontend doesn't
  request page 2+ yet)
- Property image upload/gallery — no seeded property has media, every card falls back to a
  placeholder image

## Structure

```
app/
  pages/
    index.vue                    hero search, featured listings, overview map
    properties/index.vue         cian.ru-style filtered search results (sidebar + list)
    properties/[id].vue          aura.tj-simplified detail + real viewing-request form
    territories/[slug].vue       listings within one territory
    account/login.vue / account/register.vue
  components/
    SiteHeader.vue / SiteFooter.vue / LocaleSwitcher.vue / ThemeToggle.vue
    SearchBar.vue                 hero search with territory-name autocomplete
    FilterSidebar.vue / TerritoryFilter.vue
    PropertyCard.vue / PropertyList.vue
    PropertyMap.vue               Yandex Maps v3 wrapper
  plugins/
    auth.client.ts                 restores the Bearer token from localStorage on app init
  stores/
    auth.ts                       Pinia: token (localStorage-persisted), user
    theme.ts                      Pinia: light/dark, persisted + system-preference default
  composables/
    useApi.ts                     useFetch/$fetch wrapper — Bearer header, runtimeConfig.public.apiBase
    useProperties.ts / useTerritories.ts   live API + mock-on-failure, described above
    useViewings.ts                 POST /v1/real-estate/viewings
data/
  mockProperties.ts               fallback sample listings — 7 territories, all 7 property types
  territories.ts                  presentation metadata (slug/nameRu/lat/lng), merged onto live data
types/
  property.ts
i18n/locales/{ru,tg,uz,en}.json
```

## Regional fields (Tajikistan, not in a generic real-estate template)

`has_generator`, `has_wifi`, `has_parking`, `mountain_view`, `altitude`, `water_source`,
`max_guests` — surfaced as icon chips (⚡ 📶 🏔️ 💧) on cards and the detail page, and as filters
in `FilterSidebar`, for `mockProperties.ts` entries. See "What's real vs. what's still a
stopgap" above — live-API properties don't have this data yet. Currency is TJS only,
everywhere — no USD/EUR anywhere in the UI.

## Development

```bash
npm install
cp .env.example .env   # add a Yandex Maps API key if you have one
npm run dev            # http://localhost:3000
```

`ru`, `tg`, `uz`, `en` are reachable at `/`, `/tg`, `/uz`, `/en` respectively
(`strategy: 'prefix_except_default'`).

## Deploying to the VPS

```bash
npm run build
systemctl --user restart ihona-frontend
```

The unit file (`~/.config/systemd/user/ihona-frontend.service`, not in this repo) runs
`node .output/server/index.mjs` on `127.0.0.1:3000` with `NODE_ENV=production`. Lingering is
enabled for the deploying user so the service survives an SSH session ending.
