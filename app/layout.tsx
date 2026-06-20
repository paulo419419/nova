import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'NOVA GADGETS - Video Editor Laptops & Devices',
  description: 'Premium gadgets for video editors. Find the perfect laptop with Adobe Premiere, DaVinci Resolve, or CapCut support. Browse by budget and specifications.',
  generator: 'v0.app',
  icons: {
    icon: '/nova-gadgets-logo.jpg',
    apple: '/nova-gadgets-logo.jpg',
  },
  openGraph: {
    title: 'NOVA GADGETS',
    description: 'Your trusted gadget store for video editors',
    images: ['/nova-gadgets-logo.jpg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth bg-background">
      <head />
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
