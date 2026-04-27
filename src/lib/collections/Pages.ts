import type { CollectionConfig, Field } from "payload";

import { Archive } from "@/components/blocks/ArchiveBlock/config";
import { CallToAction } from "@/components/blocks/CallToAction/config";
import { Content, RichTextBlock } from "@/components/blocks/Content/config";
import { Faqs } from "@/components/blocks/Faqs/config";
import { FormBlock } from "@/components/blocks/Form/config";
import { Gallery } from "@/components/blocks/Gallery/config";
import { hero } from "@/components/blocks/heros/config";
import { HtmlEmbed } from "@/components/blocks/HtmlEmbed/config";
import { MediaBlock } from "@/components/blocks/MediaBlock/config";
import {
  adminOnlyAccess,
  authenticatedOrPublished,
  mixedSlugField,
  makeAdminPreview,
  META_FIELD,
  BASE_VERSIONS,
} from "@/lib/collections/fields/base-fields";
import { makeRevalidateHooks } from "@/lib/collections/hooks";
import { CollectionName } from "@/lib/core/types/types";

export const Pages: CollectionConfig = {
  slug: "pages",
  access: {
    ...adminOnlyAccess,
    read: authenticatedOrPublished,
  },
  admin: {
    defaultColumns: ["title", "slug", "updatedAt"],
    ...makeAdminPreview(CollectionName.pages),

    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      type: "tabs",
      tabs: [
        {
          fields: [hero],
          label: "Hero",
        },
        {
          fields: [
            {
              name: "layout",
              type: "blocks",
              blocks: [
                CallToAction,
                Content,
                MediaBlock,
                Archive,
                FormBlock,
                RichTextBlock,
                Gallery,
                Faqs,
                HtmlEmbed,
              ],
              required: true,
              admin: {
                initCollapsed: true,
              },
            } as Field,
          ],
          label: "Content",
        },
        META_FIELD,
      ],
    },
    mixedSlugField(),
  ],

  hooks: makeRevalidateHooks(CollectionName.pages),

  versions: BASE_VERSIONS,
};
