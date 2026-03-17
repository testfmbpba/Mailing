import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'react-hot-toast'

export const metadata: Metadata = {
  title: 'MailingBP — Plataforma de Email Marketing',
  description: 'Enviá, trackeá y gestioná tus campañas de email de forma profesional.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              borderRadius: '12px',
              fontFamily: 'var(--font-source-sans)',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  )
}
