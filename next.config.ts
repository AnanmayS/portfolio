import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: process.env.PAGES_BASE_PATH,
  /* Each page exports as <route>/index.html, which GitHub Pages serves at
     /route/ without colliding with the route's data folder. */
  trailingSlash: true,
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
