import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const body = await request.formData();
  const productId = body.get("productId");
  const productStatus = body.get("productStatus");

  try {
    const response = await admin.graphql(
      `#graphql
        mutation updateProductStatus( $input: ProductUpdateInput) {
          productUpdate(product: $input) {
            product {
              id
              title
              status
              publishedAt
            }
          }
        }`,
      {
        variables: {
          input: {
            id: productId,
            status: productStatus,
          },
        },
      },
    );

    const responseJson = await response.json();
    const product = responseJson.data?.productUpdate?.product;
    if (product) {
      return { data: product, error: null };
    }
  } catch (error) {
    return { data: [], error };
  }
};
