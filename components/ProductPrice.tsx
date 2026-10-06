import type {Product} from '../lib/catalog-types';

export function hasPromotion(product: Product) {
  return typeof product.price === 'number' && typeof product.promo_price === 'number'
    && product.promo_price > 0 && product.promo_price < product.price;
}

const money = new Intl.NumberFormat('es-MX', {style:'currency',currency:'MXN'});

export default function ProductPrice({product}:{product:Product}) {
  const promo = hasPromotion(product);
  return <div className="product-pricing">
    {(product.is_new || promo) && <div className="product-badges">
      {product.is_new && <span className="new-badge">Nuevo</span>}
      {promo && <span className="promo-badge">Promoción</span>}
    </div>}
    {typeof product.price === 'number' && product.price > 0 && <p className="product-price">
      {promo && <del aria-label="Precio anterior">{money.format(product.price)}</del>}
      <strong>{money.format(promo ? product.promo_price! : product.price)}</strong><small> MXN</small>
    </p>}
  </div>;
}
