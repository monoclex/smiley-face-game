# `@smiley-face-game/api`

The API package for `@smiley-face-game`. This package is used by the client itself, and is made a public NPM package so
bot creators can utilize this package.

### Contents

- [Installation](#installation) &mdash; See examples of installing the SFG API in different environments.
  - [With a Package Manager](#with-a-package-manager)
  - [With HTML](#with-html)
- [Examples](#examples) &mdash; Functionality and examples of it
  - [Usage in Different Environments](#usage-in-different-environments)
  - [Authentication](#authentication)
  - [Connecting to a World](#connecting-to-a-world)
  - [Chatting](#chatting)
  - [Placing Blocks](#placing-blocks)
  - [Placing Signs](#placing-signs)
  - [Handling Players and Blocks](#handling-players-and-blocks)
  - [Simulating Physics](#simulating-physics)

<!--

- [Tutorial](#tutorial) &mdash; A hand-held introduction to the SFG API.
  - [Setting Up](#setting-up) &mdash; Set up your development environment
  - [useDev](#useDev) &mdash; Understanding what `useDev()` does
  - [Logging In](#logging-in) &mdash; Logging in to SFG
  - [Connecting to SFG](#connecting-to-sfg) &mdash; Connecting to a world in SFG

-->

## Installation

### With a Package Manager

_Using [NPM](https://docs.npmjs.com/cli)_

```shell
npm i @smiley-face-game/api
```

_Using [Yarn](https://classic.yarnpkg.com/en/)_

```shell
yarn add @smiley-face-game/api
```

_Using [PNPM](https://pnpm.io/)_

```shell
pnpm add @smiley-face-game/api
```

### With HTML

**RECOMMENDED**: _Using [SkyPack](https://www.skypack.dev/) to serve ES Modules_

```html
<!-- For modern browsers, recommended. -->
<script type="module">
  import * as sfg from "https://cdn.skypack.dev/@smiley-face-game/api";
  console.log(sfg);
</script>
```

_Using [UNPKG](https://unpkg.com/) to serve JS_

```html
<!-- Imports an `sfg` global -->
<script src="https://unpkg.com/@smiley-face-game/api"></script>
<script>
  console.log(sfg);
</script>
```

## Examples

- [Usage in Different Environments](#usage-in-different-environments)
- [Authentication](#authentication)
- [Connecting to a World](#connecting-to-a-world)
- [Chatting](#chatting)
- [Placing Blocks](#placing-blocks)
- [Placing Signs](#placing-signs)
- [Handling Players and Blocks](#handling-players-and-blocks)
- [Simulating Physics](#simulating-physics)

### Usage in Different Environments

**Node (ES Modules) [RECOMMENDED]**

```js
// index.mjs
import { useDev } from "@smiley-face-game/api";
useDev();
```

**Node (CommonJS Modules)**

```js
// index.cjs
const { useDev } = require("@smiley-face-game/api");
useDev();
```

**HTML ES Modules**

```html
<!-- index.html -->
<script type="module">
  import { useDev } from "https://cdn.skypack.dev/@smiley-face-game/api";
  useDev();
</script>
```

**HTML Global**

```html
<!-- index.html -->
<script src="https://unpkg.com/@smiley-face-game/api"></script>
<script>
  sfg.useDev();
</script>
```

### Authentication

```js
import { auth, useDev } from "@smiley-face-game/api";

main().catch(console.error);
async function main() {
  // tells SFG to use the development servers (dev-smiley-face-game.sirjosh3917.com)
  useDev();

  // authenticates as a guest, with the username "wee"
  const guest = await auth({ username: "wee" });

  // logs in using an email and password
  const user = await auth({
    email: "alice@alicenbob.com",
    password: "1234",
  });
}
```

### Connecting to a World

```js
import { auth, useDev } from "@smiley-face-game/api";

main().catch(console.error);
async function main() {
  useDev();
  const client = await auth({ username: "aaa" });

  // generates a *new* dynamic world.
  const newDynamic = await client.connect({
    type: "create",
    name: "Connection Example",
    width: 25,
    height: 25,
  });

  // connects to an *existing* dynamic world.
  const existingDynamic = await client.connect({
    type: "create",
    id: newDynamic.init.worldId,
  });

  // connects to a *saved* world - these are owned by someone
  const saved = await client.connect({
    type: "join",
    id: "00000000-0000-0000-0000-000000000000",
  });
}
```

### Chatting

```js
import { auth, useDev } from "@smiley-face-game/api";

main().catch(console.error);
async function main() {
  useDev();
  const client = await auth({ username: "chatbot" });

  const connection = await client.connect({
    type: "create",
    name: "Chat Example",
    width: 10,
    height: 10,
  });

  for await (const message of connection) {
    // if we received a chat message
    if (message.packetId === "SERVER_CHAT") {
      if (message.message === "!hello") {
        // we'll send something back
        connection.chat("hi!!!");
      }
    }
  }
}
```

### Placing Blocks

```js
import { auth, useDev } from "@smiley-face-game/api";

main().catch(console.error);
async function main() {
  useDev();
  const client = await auth({ username: "blockbot" });

  const connection = await client.connect({
    type: "create",
    name: "Blocks Example",
    width: 10,
    height: 10,
  });

  // use `tileJson` to get the numeric id of `basic-red`.
  // for the names of tiles, it's best to consult `tiles.json`
  // you can find a `name` -> `image` mapping at:
  //   `packages/client/src/assets/tiles`
  const redId = connection.tileJson.id("basic-red");

  // fill the world with it
  for (let y = 0; y < connection.init.size.height; y++) {
    for (let x = 0; x < connection.init.size.width; x++) {
      connection.place(redId, { x: x, y: y });
    }
  }
}
```

### Placing Signs

```js
import { auth, useDev } from "@smiley-face-game/api";

main().catch(console.error);
async function main() {
  useDev();
  const client = await auth({ username: "blockbot" });

  const connection = await client.connect({
    type: "create",
    name: "Signs Example",
    width: 10,
    height: 10,
  });

  const signId = connection.tileJson.id("sign");

  // place a sign, using the third argument for additional data
  // fun fact: you can place a sign without any additional data at all! if you
  // don't specify any data, you'll get a blank sign
  connection.place(
    signId,
    { x: 1, y: 1 },
    {
      kind: "sign",
      text: "hello world!",
    }
  );
}
```

### Handling Players and Blocks

```js
import { auth, useDev, Game, TileLayer } from "@smiley-face-game/api";

main().catch(console.error);
async function main() {
  useDev();
  const client = await auth({ username: "blockbot" });

  const connection = await client.connect({
    type: "create",
    name: "Players and Blocks Example",
    width: 10,
    height: 10,
  });

  // create a new "game" instance. the game instance is the **exact same code**
  // that the actual game itself uses. that's right - your bot can be just as
  // sophisticated as a player!
  //
  // in our case, we'll use the `game` to handle blocks for us.
  const game = new Game(connection.tileJson, connection.init);

  for await (const message of connection) {
    // the first line of code in the loop should be this. this will tell the
    // game about messages received and handle them accordingly.
    //
    // for our purposes, we only care about the fact that it will handle blocks
    // (and players).
    game.handleEvent(message);

    // if the player says "tell me"
    if (message.packetId === "SERVER_CHAT" && message.message === "tell me") {
      // we use `game.players` to get access to the players.
      const sender = game.players.get(message.playerId);

      // get the ID of the block at 0, 0 (upper left corner of world)
      const blockId = game.blocks.blockAt(0, 0, TileLayer.Foreground);

      // the blockId is a numeric number that won't make sense to a human.
      // let's change it to the name of the texture, using `tileJson`!
      const blockName = connection.tileJson.texture(blockId);

      // tell them what block is at 0, 0
      connection.chat(`hey ${sender.name}: there is a ${blockName} at 0, 0!`);
    }
  }
}
```

### Simulating Physics

```js
import { auth, useDev, Game } from "@smiley-face-game/api";

main().catch(console.error);
async function main() {
  useDev();
  const client = await auth({ username: "blockbot" });

  const connection = await client.connect({
    type: "create",
    name: "Physics Example",
    width: 10,
    height: 10,
  });

  const game = new Game(connection.tileJson, connection.init);

  // the `game.update()` function takes the total number of elapsed milliseconds
  // let's start recording right now as the start of physics simulation
  const start = Date.now();

  // now, we call `game.update` every `game.physics.optimalTickRate` milliseconds,
  // passing in the total number of milliseconds since `start`.
  //
  // this will run the physics system, so we can get accurate values for x and y.
  // physics in your bot - isn't that great?
  setInterval(() => game.update(Date.now() - start), game.physics.optimalTickRate);

  for await (const message of connection) {
    game.handleEvent(message);

    if (message.packetId === "SERVER_CHAT" && message.message === "where am i") {
      const player = game.players.get(message.playerId);

      const { x, y } = player.position;
      connection.chat(`you are at ${x}, ${y}!`);
    }
  }
}
```
