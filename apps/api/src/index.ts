import { greet } from "shared";

const server = Bun.serve({
  port: 3001,
  fetch(req) {
    const url = new URL(req.url);
    if (url.pathname === "/api/hello") {
      return Response.json({ message: greet("API") });
    }
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`API jalan di http://localhost:${server.port}`);
