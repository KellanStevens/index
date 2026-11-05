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

`public/_headers` caches the fingerprinted files in `/_astro/` for a year.

## CI/CD

The workflows in `.github/workflows/` hold only the settings of this site. The
jobs come from [KellanStevens/ci](https://github.com/KellanStevens/ci), pinned
by commit SHA with the release tag as a comment, and Renovate opens a pull
request to move the pins when a new release is tagged.

CI does not use Nix. It installs the Bun version in `.bun-version` and the
Node version in `.nvmrc`.

| Event                               | Workflow                       | URL                                     |
| ----------------------------------- | ------------------------------ | --------------------------------------- |
| Every pull request and push to main | `ci.yml`: `check`, `audit`     |                                         |
| Push to `main`, for example a merge | `ci.yml`: `deploy`             | https://kellanstevens.com               |
| A pull request that is not a draft  | `preview.yml`, after CI passes | `https://pr-<number>.kellanstevens.com` |
| A pull request closes               | `preview-cleanup.yml`          |                                         |

- **check:** lint, typecheck, test and build. Each step runs even if an
  earlier one failed, so one run reports all failures.
- **audit:** `bun audit` on `bun.lock`. It does not block a deploy. An
  advisory with no fix is listed under `ignore` in `ci.yml`, with the reason.
- **Previews:** each pull request gets its own Worker, `index-pr-<number>`, one
  level below the zone so that Universal SSL covers it at once. A bot comment
  on the pull request shows the URL. Drafts, forks, and pull requests that
  change none of the `paths` in `preview.yml` get no preview. `preview.yml`
  runs from `main` (`workflow_run`), so the code of a pull request never runs
  where a secret is. For the same reason, a pull request that changes
  `wrangler.jsonc` previews with the config of `main`.

### Access

Production and previews are public, so `deploy` and `preview` both have
`require-access: false`. CI does not check for an Access login page. Previews
still get an `X-Robots-Tag: noindex` header (`noindex: true` in `preview.yml`),
because the build itself allows search engines.

If the Zero Trust dashboard still has a self-hosted application for
`pr-*.kellanstevens.com`, delete it. Otherwise previews stay behind a login.

### Secrets

The secrets are in two GitHub environments, `production` and `preview`, not in
the repository secrets. With deployment branches set to `main` only, a branch
or pull request cannot read them, even if it changes a workflow.

```sh
gh secret set CLOUDFLARE_API_TOKEN --env production
gh secret set CLOUDFLARE_API_TOKEN --env preview
```

Make each `CLOUDFLARE_API_TOKEN` from the "Edit Cloudflare Workers" template,
scoped to the account and the `kellanstevens.com` zone. The token needs zone
access so that `wrangler deploy` can attach the custom domain. Cloudflare
cannot limit a token to one Worker, so the preview token can also change
production. This is why only workflows on `main` get it.

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
