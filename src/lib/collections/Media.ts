import type { CollectionConfig } from "payload";

import { makeMediaCollection } from "@/lib/collections/fields/base-fields";

// Generic media for hero and content-block images. No size variants here — editors
// crop/focal-point these manually via Payload's built-in upload UI. Gallery and SEO
// images have their own collections (own size variants); see GalleryMedia/SeoMedia.
export const Media: CollectionConfig = makeMediaCollection({
  slug: "media",
});
