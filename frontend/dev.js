import { join } from "path";
import { statSync } from "fs";

const PROJECT_ROOT = process.cwd();
const PUBLIC_DIR = join(PROJECT_ROOT, "public");
const SRC_DIR = join(PROJECT_ROOT, "src");

export default {
  root: PROJECT_ROOT,
  port: 3000,
  hostname: "localhost",
  development: true,
  entrypoints: ["./src/index.js"],
  publicDir: PUBLIC_DIR,
  define: {
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "development"
    ),
  },
  plugins: [
    {
      name: "react-refresh",
      setup(build) {
        build.onEnd(() => {
          console.log("Build completed!");
        });
      },
    },
  ],
};
