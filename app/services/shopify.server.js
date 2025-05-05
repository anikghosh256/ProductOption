import { log } from "./log.server.js";

/**
 * Get metafield definition of PRODUCT
 *
 * @param {Object} graphql - Shopify graphql instance
 * @param {string} namespace - metafield namespace
 * @param {Array} keys - metafield keys
 *
 * @returns {Promise<Object>} metafield definition
 */
export async function getMetafieldDefinition(graphql, namespace, keys) {
  try {
    // TODO: use filter to get metafield definition by namespace and keys
    const response = await graphql(`
      #graphql
      query {
        metafieldDefinitions(first: 250, ownerType: PRODUCT) {
          nodes {
            name
            key
            namespace
            id
            ownerType
          }
        }
      }
    `);

    const data = await response.json();
    const metafieldDefinition = data?.data?.metafieldDefinitions?.nodes || [];

    const matchedDefinitions = metafieldDefinition.filter((item) => {
      return item.namespace === namespace && keys.includes(item.key);
    });

    // make key value pair
    const metafieldDefinitionItem = matchedDefinitions.reduce((acc, item) => {
      acc[item.key] = item;
      return acc;
    }, {});

    return metafieldDefinitionItem;
  } catch (error) {
    await log(error);
    return null;
  }
}

/**
 * Create metafield definition
 *
 * @param {Object} graphql - Shopify graphql instance
 * @param {string} namespace - metafield namespace
 * @param {string} key - metafield key
 * @param {string} owner - metafield owner
 *
 * @returns {Promise<Object>} metafield definition
 */
export async function createMetafieldDefinition(
  graphql,
  namespace,
  key,
  owner,
  type = "json",
  title = null,
) {
  try {
    const response = await graphql(
      `
        #graphql
        mutation CreateMetafieldDefinition(
          $definition: MetafieldDefinitionInput!
        ) {
          metafieldDefinitionCreate(definition: $definition) {
            createdDefinition {
              id
              namespace
              key
              name
              ownerType
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          definition: {
            type: type,
            namespace: namespace,
            name: title || key,
            key: key,
            ownerType: owner,
            pin: true,
          },
        },
      },
    );

    const data = await response.json();
    const metafieldDefinition =
      data?.data?.metafieldDefinitionCreate?.createdDefinition;
    if (!metafieldDefinition) {
      throw new Error("Metafield definition not found");
    }
    return metafieldDefinition;
  } catch (error) {
    await log(error);
    return null;
  }
}

/**
 * Get theme configs
 *
 * @param {Object} graphql - Shopify graphql instance
 *
 * @returns {Promise<Object>} theme configs
 */
export async function getIsExtensionEnabled(graphql) {
  try {
    const response = await graphql(`
      #graphql
      query GetThemeConfiguration {
        themes(first: 10, roles: [MAIN]) {
          nodes {
            id
            name
            role
            files(first: 10, filenames: ["templates/product.json"]) {
              edges {
                node {
                  body {
                    ... on OnlineStoreThemeFileBodyText {
                      content
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const data = await response.json();
    const themes = data?.data?.themes?.nodes;
    const theme = themes.find((theme) => theme.role === "MAIN");
    const settingsData = theme?.files?.edges[0]?.node?.body?.content;

    let isEnabled = false;
    if (settingsData) {
      const themeConfig = JSON.parse(
        settingsData.replace(/\/\*[\s\S]*?\*\//g, "").trim(),
      );

      const blocks = themeConfig?.sections?.main?.blocks || {};
      Object.keys(blocks).forEach((key) => {
        if (key?.includes("normalize_gift_wrap_message_normalize")) {
          isEnabled = true;
        }
      });
    }

    return isEnabled;
  } catch (error) {
    await log(error);
    return null;
  }
}

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
