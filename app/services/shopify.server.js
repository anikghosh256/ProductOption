import { log } from "./log.server.js";

/**
 * Get shopify products
 *
 * @param {Object} graphql - Shopify graphql instance
 *
 * @returns {Promise<Object>} products *
 */
export async function getProducts(graphql) {
  try {
    const productResponse = await graphql(`
      #graphql
      query {
        products(first: 10, sortKey: PUBLISHED_AT, reverse: true) {
          edges {
            node {
              id
              title
              status
              publishedAt
              priceRangeV2 {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    `);

    const data = await productResponse.json();
    const products = data?.data?.products?.edges || [];
    return {
      data: products,
      error: null,
    };
  } catch (error) {
    await log(error);
    return {
      data: null,
      error: error,
    };
  }
}
