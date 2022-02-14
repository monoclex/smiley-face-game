try {
  const command =
    "docker run --rm -p 5432:5432 -e POSTGRES_USER=sfg -e POSTGRES_PASSWORD=dev postgres";
  require("child_process").execSync(command, { stdio: "inherit" });
} catch (ok) {}
