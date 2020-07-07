# Smiley Face Game
Don't expect to be able to contribute, or even expect clean code for that matter. This is *very* WIP, and everything is painful.

Please join our [discord server](https://discord.gg/c68KMCs) for updates!

# Setup development environment

1. Run setup script (as adminstrator)
2. [Install deno](https://deno.land/#installation)
3. [Install vscode](https://code.visualstudio.com/Download)
4. [Install deno extension](https://marketplace.visualstudio.com/items?itemName=denoland.vscode-deno) for vscode

## Client

1. Open the client folder in vscode
2. Run `yarn` (or `npm install`) in a new terminal (press `` ctrl+` `` in vscode to open a new one)
3. Set the TypeScript version to the workspace's version by pressing `ctrl+shift+p` and typing `>TypeScript: Select TypeScript Version...`
4. To run the game, execute `yarn dev` (make sure the server is running)

## Server

1. Open the server folder in vscode
2. Run `deno run --allow-net ./server.ts` in a new terminal (press `` ctrl+` `` in vscode to open a new one)
