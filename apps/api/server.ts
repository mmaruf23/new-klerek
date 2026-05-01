import { serve } from "@hono/node-server";
import app from "./src/index.js";

serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
