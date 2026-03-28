import { createApp } from "./app.js";

const port = Number(process.env.PORT || 3001);
const dataFile = process.env.DATA_FILE;

const app = createApp({ dataFile });

app.listen(port, () => {
  console.log(`API server listening on http://127.0.0.1:${port}`);
});
