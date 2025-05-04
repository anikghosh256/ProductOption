import { getProducts } from "../services/shopify.server";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const products = await getProducts(admin.graphql);

  return { products };
};
