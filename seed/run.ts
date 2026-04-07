import "dotenv/config";
import dotenv from "dotenv";
dotenv.config();
import { getPayload, migrate } from "payload";
import configPromise from "@payload-config";

import SeedService from "./index";
// pnpm tsx seed/run.ts

async function run() {
  // const { execSync } = await import("node:child_process");

  // execSync("yes | payload migrate:fresh", {
  //   stdio: "inherit",
  //   env: process.env,
  //   shell: process.platform === "win32" ? "cmd.exe" : "/bin/sh",
  // });
  // await migrate({ config: configPromise, fresh: true });
  const payload = await getPayload({ config: configPromise });

  const seed = new SeedService(payload, "reset");

  await seed.run();

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

/*
TEMP FIX: Payload CLI env loader crash (Node 22 + @next/env)

node -e "
const fs = require('fs');
const path = 'node_modules/.pnpm/payload@3.81.0_graphql@16.13.2_typescript@5.9.3/node_modules/payload/dist/bin/loadEnv.js';
let content = fs.readFileSync(path, 'utf8');
content = content.replace(
  \"import nextEnvImport from '@next/env';\",
  \"import * as nextEnvImport from '@next/env';\"
);
fs.writeFileSync(path, content);
console.log('Patched!');
"

*/
