# ihona-frontend

Nuxt 3/4 (SSR) storefront for [ihona.tj](https://ihona.tj) — real estate and tourist-rental
listings across Tajikistan. Consumes the `ihona` Laravel host's REST API; see that repo's
`CLAUDE.md` ("Nuxt 3 Frontend" section) for the boundary/contract between the two repositories.

Design reference: search/listing pages follow cian.ru's layout (filter sidebar + result list);
the property detail page is intentionally simpler, closer to the local competitor aura.tj, with
no metro/transit field — Tajikistan has no metro.

## Stack

- Nuxt (srcDir `app/`), Vue 3 Composition API, TypeScript, SSR on
- Tailwind CSS 4 (`@tailwindcss/vite`)
- Pinia — `stores/auth.ts` (Bearer token), `stores/theme.ts` (light/dark)
- `@nuxtjs/i18n` — `ru` (default, unprefixed), `tg`, `uz`, `en` (prefixed)
- Yandex Maps JS API v3, loaded client-side only (`components/PropertyMap.vue`)
- Auth: Sanctum Bearer tokens via `POST /v1/auth/token` (`identity-core-api` module on the
  host) — not SPA cookie auth

## Current status — read before wiring real data

The host's real-estate API (`/v1/real-estate/properties`, `/v1/real-estate/territories`, …) is
gated by `auth:sanctum` with **no public/anonymous browse endpoint**, and `identity-core-api`
(the login/token-issuance module) doesn't exist on the host yet. So:

- `composables/useProperties.ts` / `useTerritories.ts` fetch live data only when a token is
  present, and otherwise fall back to `data/mockProperties.ts` / `data/territories.ts` — this
  keeps the site browsable and demoable now.
- `pages/login.vue` posts to `/v1/auth/token`, which will fail until `identity-core-api` ships.
- `pages/register.vue` is UI-only — no registration endpoint is designed yet.
- `PropertyMap.vue` needs `NUXT_PUBLIC_YANDEX_MAPS_API_KEY` — without it, it renders a plain
  placeholder instead of a broken map.

Once the host adds a public listings endpoint (or a guest-token flow is decided), swap the mock
fallback in `useProperties()`/`useTerritories()` for real fetches.

## Deferred to a follow-up pass (not in this build)

- Yandex Maps marker **clustering** (`@yandex/ymaps3-clusterer`) — currently one plain marker
  per point, fine at today's listing counts
- PWA (`@vite-pwa/nuxt`), offline mode / image caching for mountain areas with poor connectivity
- `@nuxtjs/sitemap`
- Autocomplete-driven search suggestions beyond the territory-name matcher already in `SearchBar`
- Infinite scroll on `/properties` (currently a plain filtered list, no pagination yet)

## Structure

```
app/
  pages/
    index.vue                    hero search, featured listings, overview map
    properties/index.vue         cian.ru-style filtered search results (sidebar + list)
    properties/[id].vue          aura.tj-simplified property detail
    territories/[slug].vue       listings within one territory
    login.vue / register.vue
  components/
    SiteHeader.vue / SiteFooter.vue / LocaleSwitcher.vue / ThemeToggle.vue
    SearchBar.vue                 hero search with territory-name autocomplete
    FilterSidebar.vue / TerritoryFilter.vue
    PropertyCard.vue / PropertyList.vue
    PropertyMap.vue               Yandex Maps v3 wrapper
  stores/
    auth.ts                       Pinia: token (localStorage-persisted), user
    theme.ts                      Pinia: light/dark, persisted + system-preference default
  composables/
    useApi.ts                     useFetch/$fetch wrapper — Bearer header, runtimeConfig.public.apiBase
    useProperties.ts / useTerritories.ts   live-fetch-with-mock-fallback described above
data/
  mockProperties.ts               sample listings — 7 territories, all 7 property types
  territories.ts                  mirrors the host's TerritorySeeder — keep in sync
types/
  property.ts
i18n/locales/{ru,tg,uz,en}.json
```

## Regional fields (Tajikistan, not in a generic real-estate template)

`has_generator`, `has_wifi`, `has_parking`, `mountain_view`, `altitude`, `water_source`,
`max_guests` — surfaced as icon chips (⚡ 📶 🏔️ 💧) on cards and the detail page, and as filters
in `FilterSidebar`. Currency is TJS only, everywhere — no USD/EUR anywhere in the UI.

## Development

```bash
npm install
cp .env.example .env   # add a Yandex Maps API key if you have one
npm run dev            # http://localhost:3000
```

`ru`, `tg`, `uz`, `en` are reachable at `/`, `/tg`, `/uz`, `/en` respectively
(`strategy: 'prefix_except_default'`).
