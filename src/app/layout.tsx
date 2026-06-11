import type { Metadata, Viewport } from 'next'
import { Geist, Merriweather, Nunito, Press_Start_2P } from 'next/font/google'
import './globals.css'
import '@/styles/components.scss'
import '@/styles/room.scss'
import { ThemeProvider } from './_components/ThemeContext'
import AboutBookModal from './_components/AboutBookModal'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const merriweather = Merriweather({
  variable: '--font-heading',
  subsets: ['latin'],
  weight: ['400', '700'],
})

const nunito = Nunito({
  variable: '--font-body',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

const pressStart2P = Press_Start_2P({
  variable: '--font-accent',
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://bookroom.vercel.app'),
  title: {
    template: '%s | Bookroom',
    default: 'Bookroom — Your Cozy Personal Library',
  },
  description: 'Track your reading journey with Bookroom. Organize books with a Kanban board, rate your favorites, and manage your personal library in a cozy pixel-art room.',
  applicationName: 'Bookroom',
  openGraph: {
    title: 'Bookroom — Your Cozy Personal Library',
    description: 'Track your reading journey with Bookroom. Organize books with a Kanban board, rate your favorites, and manage your personal library.',
    url: 'https://bookroom.vercel.app',
    siteName: 'Bookroom',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bookroom — Your cozy personal library',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bookroom — Your Cozy Personal Library',
    description: 'Track your reading journey with Bookroom. Organize books with a Kanban board, rate your favorites, and manage your personal library.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [
      { url: '/icon/favicon.ico', sizes: 'any' },
      { url: '/icon/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
    ],
    apple: [
      { url: '/icon/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdf8f0' },
    { media: '(prefers-color-scheme: dark)', color: '#1e1a14' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${merriweather.variable} ${nunito.variable} ${pressStart2P.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var t = localStorage.getItem('theme')
                var d = window.matchMedia('(prefers-color-scheme: dark)').matches
                var r = t || (d ? 'dark' : 'light')
                document.documentElement.classList.add(r)
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Bookroom',
              description: 'Your cozy personal library. Track what you read, what you love, and what\'s next.',
              url: 'https://bookroom.vercel.app',
              applicationCategory: 'LifestyleApplication',
              operatingSystem: 'Any',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
        <ThemeProvider>{children}</ThemeProvider>
        <AboutBookModal />
      </body>
    </html>
  )
}
