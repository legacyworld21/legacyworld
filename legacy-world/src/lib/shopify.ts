// Cliente mínimo de la Storefront API de Shopify (GraphQL).
// Configura EXPO_PUBLIC_SHOPIFY_DOMAIN y EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN en .env
// (el token de Storefront es público por diseño; NUNCA pongas el Admin API token en la app).
const domain = process.env.EXPO_PUBLIC_SHOPIFY_DOMAIN;
const token = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN;

export const shopifyEnabled = Boolean(domain && token);

export async function storefront<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
  if (!shopifyEnabled) throw new Error('Shopify no configurado');
  const res = await fetch(`https://${domain}/api/2025-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': token! },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data as T;
}

export const PRODUCTS_QUERY = /* GraphQL */ `
  query Products($first: Int!) {
    products(first: $first) {
      nodes { id title tags featuredImage { url } priceRange { minVariantPrice { amount currencyCode } } }
    }
  }`;

// Checkout: crea un carrito y abre `checkoutUrl` (Shopify procesa pago y pedido).
export const CART_CREATE = /* GraphQL */ `
  mutation CartCreate($lines: [CartLineInput!]!) {
    cartCreate(input: { lines: $lines }) { cart { id checkoutUrl } userErrors { message } }
  }`;
