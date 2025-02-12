import { serve } from "bun";
import { join } from "path";

const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = join(PROJECT_ROOT, "public");

const server = serve({
  port: 3000,
  hostname: "localhost",
  development: true,
  fetch(req) {
    const url = new URL(req.url);

    // Serve static files from public directory
    if (url.pathname.startsWith("/static")) {
      return new Response(Bun.file(join(PUBLIC_DIR, url.pathname)));
    }

    // Serve index.html for all routes (for client-side routing)
    return new Response(Bun.file(join(PUBLIC_DIR, "index.html")));
  },
});

console.log(`Listening on http://${server.hostname}:${server.port}`);
