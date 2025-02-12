import { serve } from "bun";
import path from "path";

const PROJECT_ROOT = import.meta.dir;
const PUBLIC_DIR = path.resolve(PROJECT_ROOT, "public");
const BUILD_DIR = path.resolve(PROJECT_ROOT, "build");

export default {
  port: 3000,
  hostname: "localhost",
  development: true,
  serve(req) {
    const url = new URL(req.url);

    // Serve static files from public directory
    if (url.pathname.startsWith("/static")) {
      return new Response(Bun.file(path.join(PUBLIC_DIR, url.pathname)));
    }

    // Serve index.html for all other routes (for client-side routing)
    return new Response(Bun.file(path.join(PUBLIC_DIR, "index.html")));
  },
};
