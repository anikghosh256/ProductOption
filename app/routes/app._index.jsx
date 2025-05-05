import { useEffect } from "react";
import { useSubmit, useLoaderData, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineGrid,
  InlineStack,
  Banner,
  Badge,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import IndexTable from "../components/IndexTable";
import {
  getMetafieldDefinition,
  createMetafieldDefinition,
} from "../services/shopify.server";

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);

  const metaFields = await getMetafieldDefinition(
    admin.graphql,
    "custom",
    ["size_chart", "care_instructions"],
    "product",
  );

  // extension links
  const badge = `https://${session.shop}/admin/themes/current/editor?template=product&addAppBlockId=${process.env.SHOPIFY_PRODUCTOPTIONS_ID}/badge&
target=mainSection`;
  const sizeChart = `https://${session.shop}/admin/themes/current/editor?template=product&addAppBlockId=${process.env.SHOPIFY_PRODUCTOPTIONS_ID}/size-chart&
target=mainSection`;
  const careInstructions = `https://${session.shop}/admin/themes/current/editor?template=product&addAppBlockId=${process.env.SHOPIFY_PRODUCTOPTIONS_ID}/care-instructions&
target=mainSection`;

  return { metaFields, links: { badge, sizeChart, careInstructions } };
};

export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const body = await request.formData();
  const type = body.get("type");

  try {
    if (type === "size_chart") {
      await createMetafieldDefinition(
        admin.graphql,
        "custom",
        "size_chart",
        "PRODUCT",
        "file_reference",
        "Size Chart",
      );
    } else if (type === "care_instructions") {
      await createMetafieldDefinition(
        admin.graphql,
        "custom",
        "care_instructions",
        "PRODUCT",
        "rich_text_field",
        "Care Instructions",
      );
    }

    return { success: "Metafield definition created successfully" };
  } catch (error) {
    return { error: error.message };
  }
};

export default function Index() {
  const { metaFields, links } = useLoaderData();
  const actionData = useActionData();
  useEffect(() => {
    if (actionData) {
      if (actionData.success) {
        shopify.toast.show(actionData.success, {
          duration: 3000,
        });
        actionData.success = null;
      } else if (actionData.error) {
        shopify.toast.show(actionData.error, {
          duration: 3000,
          isError: true,
        });
        actionData.error = null;
      }
    }
  }, [actionData]);

  const submit = useSubmit();

  return (
    <Page>
      <BlockStack gap="500">
        <Layout>
          {!metaFields?.size_chart && (
            <Layout.Section>
              <Banner
                title="You need to add size chart metafield definition."
                action={{
                  content: "Add",
                  onAction: () => {
                    const formData = new FormData();
                    formData.append("type", "size_chart");

                    submit(formData, { method: "post" });
                  },
                }}
                tone="warning"
              >
                <List>
                  <List.Item>
                    Metafield definition is not found. Please add it by clicking
                    the add Button below. Current status is{" "}
                    <Badge
                      tone={metaFields?.size_chart ? "success" : "critical"}
                    >
                      {metaFields?.size_chart ? "Added" : "Not found"}
                    </Badge>
                    .
                  </List.Item>
                </List>
              </Banner>
            </Layout.Section>
          )}

          {!metaFields?.care_instructions && (
            <Layout.Section>
              <Banner
                title="You need to add care instructions metafield definition."
                action={{
                  content: "Add",
                  onAction: () => {
                    const formData = new FormData();
                    formData.append("type", "care_instructions");

                    submit(formData, { method: "post" });
                  },
                }}
                tone="warning"
              >
                <List>
                  <List.Item>
                    Metafield definition is not found. Please add it by clicking
                    the add Button below. Current status is{" "}
                    <Badge
                      tone={
                        metaFields?.care_instructions ? "success" : "critical"
                      }
                    >
                      {metaFields?.care_instructions ? "Added" : "Not found"}
                    </Badge>
                    .
                  </List.Item>
                </List>
              </Banner>
            </Layout.Section>
          )}

          <Layout.Section>
            <InlineGrid columns={2} gap={"400"}>
              <Card roundedAbove="sm">
                <InlineStack gap={"150"}>
                  <Text as="h2" variant="headingSm">
                    Update metafields defination
                  </Text>
                </InlineStack>
                <Box paddingBlock={300}>
                  <Text as="p" variant="bodyMd">
                    Modify the metafields definition for the product.
                  </Text>
                  <Box paddingBlockStart="200">
                    <Button
                      variant="primary"
                      onClick={() => {
                        open(
                          `shopify://admin/settings/custom_data/product/metafields`,
                          "_top",
                        );
                      }}
                    >
                      Update
                    </Button>
                  </Box>
                </Box>
              </Card>
              <Card roundedAbove="sm">
                <InlineStack gap={"150"}>
                  <Text as="h2" variant="headingSm">
                    Enable Extension
                  </Text>
                </InlineStack>
                <Box paddingBlockStart="200">
                  <Box paddingBlockStart="200">
                    <Text as="p" variant="bodyMd">
                      You need to enable the extension in order to use it. Click
                      the link below to enable it.
                    </Text>
                  </Box>
                  <Box paddingBlockStart="200">
                    <Link url={links.badge} target="_blank" removeUnderline>
                      Badge
                    </Link>
                    {",  "}
                    <Link url={links.sizeChart} target="_blank" removeUnderline>
                      Size Chart
                    </Link>
                    {", "}
                    <Link
                      url={links.careInstructions}
                      target="_blank"
                      removeUnderline
                    >
                      Care Instruction
                    </Link>
                  </Box>
                </Box>
              </Card>
            </InlineGrid>
          </Layout.Section>

          <Layout.Section>
            <IndexTable></IndexTable>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
