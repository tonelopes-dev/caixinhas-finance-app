import type React from "react"
import type { Metadata } from "next"
import { Alegreya } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const alegreya = Alegreya({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Caixinhas - Sonhar juntos é o primeiro passo para conquistar",
  description:
    "Aplicativo de finanças colaborativo para casais. Planeje seu futuro financeiro juntos e realize seus sonhos em conjunto.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${alegreya.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
