'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="error-page"><h1>El catálogo no está disponible en este momento.</h1><p>Inténtalo de nuevo en unos instantes.</p><button className="button primary" onClick={reset}>Volver a intentar</button></main>}
