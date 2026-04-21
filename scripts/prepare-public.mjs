import { cp, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const publicDir = path.join(rootDir, "public");

await mkdir(publicDir, { recursive: true });

for (const entry of await readdir(publicDir, { withFileTypes: true })) {
  if (entry.name === "favicon.ico" || entry.name === "hero-illustration.png" || entry.name === "placeholder.svg" || entry.name === "robots.txt") {
    continue;
  }

  await rm(path.join(publicDir, entry.name), { recursive: true, force: true });
}

await cp(distDir, publicDir, { recursive: true, force: true });
