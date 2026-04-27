import type { Block, Field } from "payload";

import { RICH_TEXT_FIELD } from "@/lib/collections/fields/base-fields";
import { link } from "@/lib/collections/fields/link";

export const columnFields: Field[] = [
  {
    name: "size",
    type: "select",
    defaultValue: "oneThird",
    options: [
      {
        label: "One Third",
        value: "oneThird",
      },
      {
        label: "Half",
        value: "half",
      },
      {
        label: "Two Thirds",
        value: "twoThirds",
      },
      {
        label: "Full",
        value: "full",
      },
    ],
  },
  {
    ...RICH_TEXT_FIELD,
    name: "richText",
    required: false,
  } as Field,
  {
    name: "enableLink",
    type: "checkbox",
  },
  link({
    overrides: {
      admin: {
        condition: (_data, siblingData) => {
          return Boolean(siblingData?.enableLink);
        },
      },
    },
  }),
];

export const Content: Block = {
  slug: "content",
  interfaceName: "ContentBlock",
  fields: [
    {
      name: "columns",
      type: "array",
      admin: {
        initCollapsed: true,
      },
      fields: columnFields,
    },
  ],
};

export const RichTextBlock: Block = {
  slug: "richText",
  interfaceName: "RichTextBlock",
  fields: [RICH_TEXT_FIELD as Field],
};
