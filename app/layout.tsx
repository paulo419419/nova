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
    <html lang="en" className="scroll-smooth">
      <head>
        <style>{`
          :root {
            --background: 0 0% 100%;
            --foreground: 0 0% 3%;
            --card: 0 0% 100%;
            --card-foreground: 0 0% 3%;
            --primary: 210 100% 50%;
            --primary-foreground: 0 0% 100%;
            --secondary: 210 40% 96%;
            --secondary-foreground: 0 0% 3%;
            --accent: 210 100% 50%;
            --accent-foreground: 0 0% 100%;
            --muted: 210 40% 96%;
            --muted-foreground: 215 13% 34%;
            --border: 214 32% 91%;
            --input: 214 32% 91%;
            --ring: 210 100% 50%;
          }
          .dark {
            --background: 0 0% 3%;
            --foreground: 0 0% 98%;
            --card: 0 0% 10%;
            --card-foreground: 0 0% 98%;
            --primary: 210 100% 50%;
            --primary-foreground: 0 0% 3%;
            --secondary: 210 17% 17%;
            --secondary-foreground: 0 0% 98%;
            --accent: 210 100% 50%;
            --accent-foreground: 0 0% 3%;
            --muted: 210 11% 25%;
            --muted-foreground: 215 11% 60%;
            --border: 210 11% 20%;
            --input: 210 11% 20%;
            --ring: 210 100% 50%;
          }
        `}</style>
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
