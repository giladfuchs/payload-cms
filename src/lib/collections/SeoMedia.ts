import type { CollectionConfig } from "payload";

import { makeMediaCollection } from "@/lib/collections/fields/base-fields";

// Dedicated collection for the SEO tab's meta image (see metaField() in base-fields.ts).
// Every upload here always gets "og" (1200x630, OpenGraph/Twitter/JSON-LD) and "card"
// (480x320, mobile-first listing thumbnails) size variants. Kept separate from the plain
// Media collection so hero/gallery/content images don't generate derivatives they never use.
export const SeoMedia: CollectionConfig = makeMediaCollection({
  slug: "seo-media",
  labels: {
    singular: "SEO Image",
    plural: "SEO Media",
  },
  description:
    "Images for the SEO tab (social sharing + listing cards). Use the Media collection instead for hero, gallery, or content images.",
  imageSizes: [
    {
      name: "card",
      width: 480,
      height: 320,
      withoutEnlargement: false,
      formatOptions: { format: "webp", options: { quality: 75 } },
    },
    {
      name: "og",
      width: 1200,
      height: 630,
      withoutEnlargement: false,
      formatOptions: { format: "webp", options: { quality: 82 } },
    },
  ],
});
