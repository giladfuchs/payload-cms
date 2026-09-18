import type { CollectionConfig } from "payload";

import { makeMediaCollection } from "@/lib/collections/fields/base-fields";

// Dedicated collection for Gallery block images. One small variant, capped for the
// mobile-first Gallery view (both the slide and the thumbnail strip use it) — see
// src/components/blocks/Gallery/Component.tsx.
export const GalleryMedia: CollectionConfig = makeMediaCollection({
  slug: "gallery-media",
  labels: {
    singular: "Gallery Image",
    plural: "Gallery Media",
  },
  description:
    "Images for the Gallery block. Use the Media collection instead for hero or content-block images.",
  imageSizes: [
    {
      name: "gallery",
      width: 600,
      withoutEnlargement: true,
      formatOptions: { format: "webp", options: { quality: 85 } },
    },
  ],
});
