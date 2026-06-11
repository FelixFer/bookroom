import type { NextConfig } from 'next'
import { version } from './package.json'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  env: {
    APP_VERSION: version,
  },
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'covers.openlibrary.org' }],
  },
}

export default nextConfig
