# `@smiley-face-game/api`

The API package for `@smiley-face-game`. This package is used by the client itself, and is made a public NPM package so
bot creators can utilize this package.

## Installation

### With a Package Manager

_Using [Yarn](https://classic.yarnpkg.com/en/)_

```shell
yarn add @smiley-face-game/api
```

_Using [NPM](https://docs.npmjs.com/cli)_

```shell
npm i @smiley-face-game/api
```

### With HTML

_Using [UNPKG](https://unpkg.com/) to serve JS_

```html
<!-- Imports an `sfg` global -->
<script src="https://unpkg.com/@smiley-face-game/api"></script>
<script>
  console.log(sfg);
</script>
```

_Using [SkyPack](https://www.skypack.dev/) to serve ES Modules_

```html
<!-- For modern browsers, recommended. -->
<script type="module">
  import * as sfg from "https://cdn.skypack.dev/@smiley-face-game/api";
  console.log(sfg);
</script>
```

## Examples

- [Usage in Different Environments](#usage-in-different-environments)
- [Authentication](#authentication)
- [Connecting to a World](#connecting-to-a-world)
- [Chatting](#chatting)
- [Placing Blocks](#placing-blocks)

### Usage in Different Environments

**Node**

```js
const { useDev } = require("@smiley-face-game/api");
useDev();
```

**HTML Global**

```html
<script src="https://unpkg.com/@smiley-face-game/api"></script>
<script>
  sfg.useDev();
</script>
```

**HTML ES Modules**

```html
<script type="module">
  import { useDev } from "https://cdn.skypack.dev/@smiley-face-game/api";
  useDev();
</script>
```

### Authentication

```js
import { auth, useDev } from "@smiley-face-game/api";

main().catch(console.error);
async function main() {
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
    type: "dynamic",
    name: "Cool new Bot World!",
    width: 25,
    height: 25,
  });

  // connects to an *existing* dynamic world.
  const existingDynamic = await client.connect({
    type: "dynamic",
    id: newDynamic.init.worldId,
  });

  // connects to a *saved* world - these are owned by someone
  const saved = await client.connect({
    type: "saved",
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
    type: "dynamic",
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
    type: "dynamic",
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
