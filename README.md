# Smiley Face Game

Don't expect to be able to contribute, or even expect clean code for that matter. This is _very_ WIP, and everything is painful.

Join our [discord server](https://discord.gg/c68KMCs) to get notified of updates!

# Contributing

Make sure you have the following setup:

- pnpm
- eslint (VSCode Extension)
- prettier (VSCode Extension)
- postgres database at port `5432` with a user `sfg` with password `dev` _(There is a helper script! Check [./scripts/run-postgres-db.js](./scripts/run-postgres-db.js) **Requires `docker`**)_

Overall, you should end up running the following:

```shell
# in a separate terminal
node scripts/run-postgres-db.js

# to start
pnpm run dev
```
