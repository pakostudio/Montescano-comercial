import Link from 'next/link';
import Image from 'next/image';
import './CinematicHero.css';

/**
 * Home hero: intentional single-model presentation.
 * The original approved TASAC3521 cutout is the sole hero photograph.
 * Do not reintroduce carousel controls, secondary models or sliders.
 */
export default function CinematicHero() {
  return (
    <section id="inicio" className="cinema cinema-single" aria-label="Montescano. Relojería mexicana desde 1998">
      <div className="cinema-atmosphere cinema-atmosphere-single" aria-hidden="true"/>
      <div className="cinema-grid" aria-hidden="true"/>
      <div className="cinema-beam" aria-hidden="true"/>
      <div className="cinema-year" aria-hidden="true">1998</div>
      <div className="cinema-copy">
        <p className="cinema-eyebrow"><span/> RELOJERÍA MEXICANA · DESDE 1998</p>
        <h1>
          <span className="cinema-line"><span>El tiempo,</span></span>
          <span className="cinema-line"><em>a tu manera.</em></span>
        </h1>
        <div className="cinema-scene-copy">
          <strong>MONTESCANO</strong>
          <p>Precisión con personalidad.</p>
        </div>
        <Link className="cinema-mobile-catalog-cta" href="/#catalogo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 5.5c2.8-.9 5.5-.5 8 1.2v12c-2.5-1.7-5.2-2.1-8-1.2v-12ZM20 5.5c-2.8-.9-5.5-.5-8 1.2v12c2.5-1.7 5.2-2.1 8-1.2v-12Z"/></svg>
          Explorar catálogo
        </Link>
      </div>
      <div className="cinema-stage cinema-stage-single">
        <div className="cinema-orbit cinema-orbit-one" aria-hidden="true"/>
        <div className="cinema-orbit cinema-orbit-two" aria-hidden="true"/>
        <div className="cinema-halo" aria-hidden="true"/>
        <div className="cinema-product-depth">
          <div className="cinema-product-reveal">
            <div className="cinema-product-float">
              <Link href="/productos/tasac3521" className="cinema-single-link" aria-label="Ver reloj Montescano TASAC3521">
                <Image
                  className="cinema-watch"
                  src="/hero/tasac3521-cutout.png"
                  alt="Reloj Montescano TASAC3521, acero inoxidable y esfera azul"
                  width={1104} height={1425}
                  sizes="(max-width:700px) 85vw,45vw"
                  priority draggable={false}
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
