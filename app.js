import path from "node:path";
import { createApp } from "./server/app.js";

const app = createApp({
  dataFile: process.env.DATA_FILE || "/tmp/umay-kids-submissions.json",
  distDir: path.resolve(process.cwd(), "public"),
});

export default app;
