// we do this in a js file because of the differences between bash/powershell/cmd are BLEH
console.log("starting docker process");
require("child_process").spawnSync("docker", [
  "run",
  "-d",
  //
  "--name",
  "sfg-postgres",
  //
  "-e",
  "POSTGRES_USER=sfg",
  //
  "-e",
  "POSTGRES_PASSWORD=dev",
  //
  "-p",
  "5432:5432",
  //
  "postgres",
]);
console.log(
  "started. if you get an error in the console saying ECONNREFUSED about port 5432 or 8080 or something, check that docker works"
);
