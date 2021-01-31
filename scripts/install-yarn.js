const npm = require("npm");
npm.load({ global: true }, () => {
  npm.commands.install(["yarn"]);
});
