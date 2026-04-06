import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import { getPayload } from "payload";
import configPromise from "@payload-config";

import SeedService from "./index";
// pnpm tsx seed/run.ts

async function run() {
  const { execSync } = await import("node:child_process");

  execSync("yes | payload migrate:fresh", {
    stdio: "inherit",
    env: process.env,
    shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh",
  });

  const payload = await getPayload({ config: configPromise });

  const seed = new SeedService(payload);

  await seed.run();

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
