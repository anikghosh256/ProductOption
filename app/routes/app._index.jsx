import { useEffect } from "react";
import { Page, Layout, Button, BlockStack } from "@shopify/polaris";
import { useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import IndexTable from "../components/IndexTable";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const shopify = useAppBridge();

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId, shopify]);

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <IndexTable></IndexTable>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
