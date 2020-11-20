const { exec } = require("child_process");
// NOTE: we use `npx` rather than `yarn` here because when we call `yarn rollup` it will refer to `@pika/pack`'s local
// copy of rollup which causes some weird error wtf idk
exports.build = () => new Promise((resolve, reject) => exec("npx rollup -c rollup.config.js", (err) => (!!err ? reject(err) : resolve())));
