# backbone-publication — repo card

> A map, not a manual. Keep it ~1 screen; point to detail, don't inline it.

## What it is
Published npm library that provides the boilerplate to bind **Backbone** models/collections to Mixmax's
publication-based reactivity layer (`publication-client`). You instantiate `PublicationModel` /
`PublicationCollection` with reactive queries from a publication-client (usually at bootstrap). A library,
not a service.

## serves          # CROSS-CUTTING (shared library) — use this block OR `domain`, never both
role: Backbone bindings for `publication-client` — reactive `PublicationModel` / `PublicationCollection`
  classes that let Backbone frontends consume Mixmax's publication reactivity layer.
referenced-by: [<fill: frontend repos that use Backbone + publication-client>]

## Code map
- entry                    -> src/index.js
- reactive Backbone classes -> src/PublicationModel.js, src/PublicationCollection.js
- helpers                  -> src/utils/
- build output             -> dist/browser/ (gulp)

## Conventions
- **npm** (`package-lock.json`). Build via **gulp** (`gulpfile.js`) → `dist/browser/`; tests run via
  `gulp erik` (custom task); lint ESLint. Pairs with `publication-client` / `publication-server`.

## Gotchas
- README's Travis badge is stale — CI is **Jenkins** (`Jenkinsfile`).

## Run / test
- `npm install` · `npm test` (`gulp erik`) · `npm run build` (`gulp`) · `npm run lint`

## Load the matching domain card
- Cross-cutting library — load the consuming capability's card (frontend / publication), not a `domain-*` for this repo.
