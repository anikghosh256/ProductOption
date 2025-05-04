import React, { useEffect, useState } from "react";
import {
  Badge,
  Card,
  EmptySearchResult,
  IndexTable,
  Spinner,
  Text,
  useBreakpoints,
  SkeletonBodyText,
} from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";
import { Knob } from "./Knob";

export default function ProductTable() {
  const fetcher = useFetcher();

  useEffect(() => {
    fetcher.load("/api/products");
  }, []);

  const products = fetcher.data?.products?.data || [];
  const breakpoints = useBreakpoints();

  const loading = fetcher.state === "loading" || !fetcher.data;
  const showEmpty = !loading && products.length === 0;

  return (
    <>
      {loading ? (
        <Card>
          <SkeletonBodyText />
          <SkeletonBodyText />
        </Card>
      ) : (
        <Card>
          <IndexTable
            resourceName={{ singular: "product", plural: "products" }}
            itemCount={products.length}
            condensed={breakpoints.smDown}
            emptyState={
              showEmpty && (
                <EmptySearchResult
                  title="No products found"
                  description="Add products in your store to get started."
                  withIllustration
                />
              )
            }
            headings={[
              { title: "Title" },
              { title: "Price" },
              { title: "Published" },
              { title: "Status" },
              { title: "Action" },
            ]}
          >
            {products.map((edge, index) => (
              <ProductRow
                key={edge.node.id}
                product={edge.node}
                index={index}
              />
            ))}
          </IndexTable>
        </Card>
      )}
    </>
  );
}

function ProductRow({ product, index, onError, onSuccess }) {
  const { id, title, status, publishedAt, priceRangeV2 } = product;
  const [currentStatus, setCurrentStatus] = useState(status);
  const [publishedDate, setPublishedDate] = useState(publishedAt);

  const [busy, setBusy] = useState(false);

  const price = priceRangeV2?.minVariantPrice;
  const priceDisplay = price ? `${price.currencyCode} ${price.amount}` : "—";

  const handleToggle = async () => {
    const nextStatus = currentStatus === "ACTIVE" ? "DRAFT" : "ACTIVE";
    setBusy(true);

    try {
      const formData = new FormData();
      formData.append("productId", id);
      formData.append("productStatus", nextStatus);

      const res = await fetch("/api/update-status", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const product = data.data;

      if (!res.ok || !product) {
        throw new Error(data.errors?.map((e) => e.message).join(", "));
      }

      setCurrentStatus(product.status);
      setPublishedDate(product.publishedAt);

      shopify.toast.show("Product status updated", {
        duration: 3000,
      });
    } catch (error) {
      setCurrentStatus(status);
      shopify?.toast?.show(`Product status update failed: ${error.message}`, {
        duration: 3000,
        isError: true,
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <IndexTable.Row id={id} position={index}>
      <IndexTable.Cell>
        <Text as="span" fontWeight="bold">
          {title}
        </Text>
      </IndexTable.Cell>
      <IndexTable.Cell>{priceDisplay}</IndexTable.Cell>
      <IndexTable.Cell>
        {" "}
        {publishedDate
          ? new Date(publishedDate).toLocaleDateString("en-US")
          : "—"}
      </IndexTable.Cell>
      <IndexTable.Cell>
        <Badge tone={currentStatus === "ACTIVE" ? "success" : "info"}>
          {currentStatus}
        </Badge>
      </IndexTable.Cell>
      <IndexTable.Cell>
        {busy ? (
          <Spinner size="small" accessibilityLabel="Updating…" />
        ) : (
          <Knob selected={currentStatus == "ACTIVE"} onClick={handleToggle} />
        )}
      </IndexTable.Cell>
    </IndexTable.Row>
  );
}
