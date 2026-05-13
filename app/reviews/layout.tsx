import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reseñas en Vivo — Expo Publicitas 2026',
  description: 'Reseñas de clientes en tiempo real durante Expo Publicitas 2026',
}

export default function ReviewsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
