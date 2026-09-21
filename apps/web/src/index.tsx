import { greet } from "shared";

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response(
      `<h1>${greet("Web")}</h1><p>Coba fetch ke /api/hello di port 3001</p>`,
      { headers: { "Content-Type": "text/html" } },
    );
  },
});

console.log(`Web jalan di http://localhost:${server.port}`);
