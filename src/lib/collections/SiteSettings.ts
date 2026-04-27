import { revalidateTag } from "next/cache";

import type { GlobalConfig } from "payload";

import {
  columnFields,
  RichTextBlock,
} from "@/components/blocks/Content/config";
import { HtmlEmbed } from "@/components/blocks/HtmlEmbed/config";
import {
  adminOnlyAccess,
  META_FIELD,
} from "@/lib/collections/fields/base-fields";
import { link } from "@/lib/collections/fields/link";
import { AppConst } from "@/lib/core/types/types";

export const SiteSettings: GlobalConfig = {
  slug: "site-settings",
  access: {
    ...adminOnlyAccess,
    read: () => true,
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          name: "general",
          label: "General",
          fields: [
            {
              name: "logo",
              label: "Logo",
              type: "upload",
              relationTo: "media",
              required: true,
            },
            {
              name: "whatsappNumber",
              label: "WhatsApp Number",
              type: "text",
            },
            {
              name: "whatsappMessage",
              label: "WhatsApp Message",
              type: "text",
            },
          ],
        },
        {
          label: "Popup",
          name: "popup",
          fields: [
            {
              name: "delaySeconds",
              label: "Delay Seconds",
              type: "number",
              defaultValue: 0,
              required: true,
              min: 0,
            },
            {
              name: "repeatDays",
              label: "Repeat Days",
              type: "number",
              defaultValue: 0,
              required: true,
              min: 0,
            },
            {
              name: "content",
              label: "Content",
              type: "blocks",
              blocks: [HtmlEmbed, RichTextBlock],
            },
          ],
        },
        {
          ...META_FIELD,
          name: "meta",
          label: "Posts",
        },
        {
          name: "header",
          label: "Header",
          fields: [
            {
              name: "navItems",
              type: "array",
              maxRows: 6,
              fields: [
                link({
                  appearances: false,
                }),
              ],
            },
          ],
        },
        {
          name: "footer",
          label: "Footer",
          fields: [
            {
              name: "navItems",
              type: "array",
              maxRows: 6,
              fields: [
                link({
                  appearances: false,
                }),
              ],
            },
            {
              name: "content",
              type: "array",
              fields: columnFields,
            },
            {
              name: "phone",
              type: "text",
            },
            {
              name: "email",
              type: "text",
            },
            {
              name: "website",
              type: "text",
            },

            {
              name: "instagram",
              type: "text",
            },
            {
              name: "facebook",
              type: "text",
            },
            {
              name: "tiktok",
              type: "text",
            },
            {
              name: "linkedin",
              type: "text",
            },
            {
              name: "youtube",
              type: "text",
            },
            {
              name: "x",
              type: "text",
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc }) => {
        try {
          revalidateTag(AppConst.CACHE_TAG_GENERAL, "max");
        } catch {}
        return doc;
      },
    ],
  },
};
