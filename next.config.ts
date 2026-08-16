import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const rootDir = path.resolve(
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url))
);

const nextConfig: NextConfig = {
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
