# Agent rules

These rules apply to every AI agent working in this repo.

## Git and pull requests

- **Never force push.** No `git push --force`, `--force-with-lease`, or `+ref` pushes, on any branch. If a push is rejected, fetch and merge or rebase, then push normally. If that isn't enough, ask.
- **Open a PR for requested work.** When asked to do work, do it on a branch (never directly on `main`) and open a pull request when it's done.
- **Never merge without confirmation.** Don't merge a PR, or enable auto-merge, until the user has explicitly confirmed in this conversation. Approval for one PR doesn't carry over to another.
- Write commit messages in [Conventional Commits](https://www.conventionalcommits.org) form, for example `feat(home): add hero`.
- Never deploy by hand (`wrangler deploy`, `bun run deploy`). A merge to `main` deploys production.

## Environment

Run every command inside the Nix dev shell (`direnv allow` once, or `nix develop`). It supplies Bun, Node and `gh`. Use Bun, never npm, pnpm or yarn.

## Checks

Run `bun run check` (lint, typecheck, test, build) before you open a pull request, and fix every error.

## Styling

- Use the components in `src/components/ui/` and the semantic tokens in `src/styles/global.css`, such as `bg-primary` or `text-on-surface`.
- Avoid arbitrary values, raw colours and inline `style` props in new code. Lint blocks them in `.ts` and `.tsx` files, but it does not check class attributes in `.astro` files, and the existing design uses some there. Add a token instead.
