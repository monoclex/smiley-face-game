# Smiley Face Game

Don't expect to be able to contribute, or even expect clean code for that matter. This is _very_ WIP, and everything is painful.

Join our [discord server](https://discord.gg/c68KMCs) to get notified of updates!

# Contributing

Before you get started, it might help to read about [Visual Studio Code development containers](https://code.visualstudio.com/docs/remote/containers). Then, after installing the [Visual Studio Code Remote - Containers](https://aka.ms/vscode-remote/download/containers) extension, open this repository in a development container and run `yarn dev` once inside.

### Don't want to use dev containers?

If you don't want to use dev containers, make sure you have the following setup:

- yarn *(There is a helper script! Check [./scripts/install-yarn.js](./scripts/install-yarn.js))*
- eslint (VSCode Extension)
- prettier (VSCode Extension)
- postgres database at port `5432` with a user `sfg` with password `dev` *(There is a helper script! Check [./scripts/run-postgres-db.js](./scripts/run-postgres-db.js) **Requires `docker`**)*

Overall, you should end up running the following:

```shell
# in a separate terminal
node scripts/run-postgres-db.js

# to start
yarn dev
```
