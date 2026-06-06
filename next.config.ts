import type { NextConfig } from "next";
const { version } = require('./package.json');

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    APP_VERSION: version,
  },
};

export default nextConfig;
