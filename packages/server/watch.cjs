const process = require("process");
const child = require("child_process");
const chokidar = require("chokidar");
const build = require("./build.cjs");

const watcher = chokidar.watch(".", { ignored: /(node_modules)|(dist)/ });
const sleep = (ms) => new Promise((resolve) => setTimeout(() => resolve(), ms));

watcher.on("ready", () => {
  console.log("watcher ready!");
  rebuild();
  restart();
  watcher.on("all", rebuild);
});

let builds = 0;
async function rebuild() {
  builds++;
  console.log("rebuilding!", builds, "concurrent builds");
  try {
    await build();
  } catch (err) {
    console.error("error building:", err);
    return;
  } finally {
    builds--;
  }

  if (builds !== 0) {
    console.log("non-primary concurrent rebuild cancelled");
    return;
  }

  restart();
}

let worker = undefined;
function restart() {
  if (worker) {
    const pid = worker.pid;

    console.log("killing worker");
    process.kill(pid, "SIGHUP");
  } else {
    console.log("spawning new worker");
    worker = child.spawn("node", ["dist/app.cjs"], {
      stdio: "inherit",
    });

    worker.on("close", () => {
      console.log("worker stopped");
      worker = undefined;
      restart();
    });
  }
}
