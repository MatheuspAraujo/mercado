import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "PreçoFácil - Comparador de Preços de Supermercados",
  description:
    "Compare preços de produtos de supermercados e encontre as melhores ofertas. Economize nas suas compras com o PreçoFácil.",
  keywords: "comparador de preços, supermercado, ofertas, economia, compras",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
