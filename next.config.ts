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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              [
                "script-src 'self' 'unsafe-inline'",
                ...(process.env.NODE_ENV !== 'production'
                  ? ["'unsafe-eval'"]
                  : []),
              ].join(' '),
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' covers.openlibrary.org data: blob:",
              "font-src 'self'",
              "connect-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
          ...(process.env.NODE_ENV === 'production'
            ? [
                {
                  key: 'Strict-Transport-Security',
                  value: 'max-age=63072000; includeSubDomains; preload',
                },
              ]
            : []),
        ],
      },
    ]
  },
}

export default nextConfig
