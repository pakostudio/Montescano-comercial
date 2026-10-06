import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getCatalog } from "../../../lib/catalog";
import { availabilityLabels } from "../../../lib/catalog-types";
import LeadForm from "../../../components/LeadForm";
import ContactActions from '../../../components/ContactActions';
import QuoteLink from '../../../components/QuoteLink';
import ProductPrice from '../../../components/ProductPrice';
import {Reveal,ActionLink} from '../../../components/MotionUI';
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = (await getCatalog()).find((p) => p.slug === slug);
  if (!p) return { title: "Modelo no encontrado" };
  return {
    title: `${p.sku} · ${p.brand}`,
    description: p.description,
    alternates: { canonical: `/productos/${slug}` },
    openGraph: {
      title: `${p.sku} · ${p.brand}`,
      description: p.description,
      images: [{ url: p.image }],
    },
  };
}
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = (await getCatalog()).find((p) => p.slug === slug);
  if (!p) notFound();
  return (
    <>
      <header className="site-header detail-header">
        <Link className="logo" href="/">
          <img
            src="/brand/montescano.png"
            alt="Montescano"
            width="164"
            height="53"
          />
        </Link>
        <Link className="text-link" href={`/?coleccion=${p.family}#catalogo`}>
          ← VOLVER A LA COLECCIÓN
        </Link>
      </header>
      <main>
        <section className="product-detail">
          <Reveal image className="detail-photo">
            <img
              src={p.image}
              alt={`${p.brand} ${p.sku}`}
              width="420"
              height="500"
            />
          </Reveal>
          <Reveal delay={.08} className="detail-copy">
            <p className="kicker">{p.brand}</p>
            <h1>{p.sku}</h1>
            <p className="detail-description">{p.description}</p>
            <ProductPrice product={p}/>
            <p className="availability">{availabilityLabels[p.availability]}</p>
            <dl>
              {[
                ["Género", p.gender],
                ["Material", p.material],
                ["Movimiento", p.movement],
                ["Resistencia al agua", p.water_resistance],
                ...p.features.map((f) => [f.label, f.value]),
              ]
                .filter(([, v]) => v)
                .map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
            </dl>
            {p.variants.length > 0 && (
              <div className="variants">
                <h2>Variantes</h2>
                {p.variants.map((v) => (
                  <Link href={`/productos/${v.slug}`} key={v.slug}>
                    {v.label} · {v.sku}
                  </Link>
                ))}
              </div>
            )}
            <ContactActions sku={p.sku}/>
            <QuoteLink sku={p.sku}/>
            <ActionLink href="#solicitud" className="button secondary">
              SOLICITAR INFORMACIÓN ↗
            </ActionLink>
            {["sets", "plumas"].includes(p.family) && (
              <Link href={`/cotizador?sku=${encodeURIComponent(p.sku)}`} className="text-link">
                COTIZAR PROYECTO →
              </Link>
            )}
          </Reveal>
        </section>
        <section id="solicitud" className="detail-form">
          <LeadForm product={p} context={`producto/${p.slug}`} />
        </section>
      </main>
      <footer>
        <Link href="/">Montescano · Catálogo comercial</Link>
        <Link href="/privacidad">Información del formulario</Link>
      </footer>
      <ContactActions sku={p.sku} floating/>
    </>
  );
}
