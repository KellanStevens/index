# index

The source of [kellanstevens.com](https://kellanstevens.com): an Astro site with
React, Tailwind and shadcn/ui, built with Bun in a Nix dev shell and served by
Cloudflare Workers as static assets.

It follows [KellanStevens/site-template](https://github.com/KellanStevens/site-template),
except that the site is public: production has no Cloudflare Access, no
`noindex` and no `Disallow` in `robots.txt`. It also keeps its own design, so
`src/components`, `src/styles` and `src/data` do not follow the template.

## Develop

```sh
direnv allow        # or: nix develop
bun install
bun run dev         # http://localhost:4321
bun run check       # lint, typecheck, test, build
bun run preview     # the build, served by Wrangler on http://localhost:8787
```

The content of the page is in `src/data/content.ts`. Colours, fonts and radii
are tokens in `src/styles/global.css`.

Lint (`oxlint` with `@shadcn/lint`) blocks arbitrary values, raw colours and
inline styles in `.ts` and `.tsx` files. It does not check class attributes in
`.astro` files.

Tailwind scans `src/` only (`source("../")` in `global.css`), so a word in a
README or a config file does not add a class to the CSS.

## Deploy

The Worker is `index`, on the custom domain `kellanstevens.com`, set in
`wrangler.jsonc`. There is no `www` hostname, and the Worker does not serve on
`workers.dev`.

A merge to `main` deploys production through the Cloudflare Workers Builds Git
integration.

`public/_headers` caches the fingerprinted files in `/_astro/` for a year.

## Versions

Local development gets Bun and Node from `flake.nix`. `.bun-version` and
`.nvmrc` pin the versions for builds outside Nix. When you update `flake.lock`,
update these files too. The dev shell shows a warning when the versions differ.

`vite.build.cssTarget` in `astro.config.mjs` keeps `-webkit-backdrop-filter` in
the CSS for Safari before 18.

### Dependency updates

`renovate.json` extends the shared presets of
[KellanStevens/ci](https://github.com/KellanStevens/ci), once the repository is
added to the [Renovate GitHub App](https://github.com/apps/renovate).

`overrides` in `package.json` forces `minimatch` to `^11.0.1` for
GHSA-g3hv-75wg-m249, as in the template. `bunfig.toml` requires a package to be
at least a day old before it installs.

TypeScript stays on 6 until `@astrojs/check` supports 7.
