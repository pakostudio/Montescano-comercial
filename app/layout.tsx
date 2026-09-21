import type { Metadata } from 'next'
import './globals.css'
import {MotionProvider} from '../components/MotionUI'
export const metadata: Metadata = { metadataBase:new URL(process.env.SITE_URL||'http://localhost:3000'),title:{default:'Montescano | Relojería mexicana desde 1998',template:'%s | Montescano'},description:'Explora relojes Montescano, Vizanti, Vizanti Kids, Smart Watch, sets y plumas. Solicita información para distribución y proyectos corporativos.',alternates:{canonical:'/'},openGraph:{type:'website',locale:'es_MX',siteName:'Montescano',title:'Montescano | Relojería mexicana desde 1998',description:'Colecciones de relojería y soluciones corporativas.'},icons:{icon:'/brand/montescano.png'} }
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="es"><body><MotionProvider>{children}</MotionProvider></body></html> }
