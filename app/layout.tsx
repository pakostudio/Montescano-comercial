import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = { title: 'Montescano | Catálogo comercial', description: 'Catálogo comercial de Montescano y sus líneas documentadas.' }
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body>{children}</body></html> }
