import type { Block, Field } from "payload";

import { RICH_TEXT_FIELD } from "@/lib/collections/fields/base-fields";

export const Archive: Block = {
  slug: "archive",
  interfaceName: "ArchiveBlock",
  fields: [
    {
      ...RICH_TEXT_FIELD,
      name: "introContent",
      label: "Intro Content",
    } as Field,
    {
      name: "populateBy",
      type: "select",
      defaultValue: "collection",
      options: [
        {
          label: "Collection",
          value: "collection",
        },
        {
          label: "Individual Selection",
          value: "selection",
        },
      ],
    },
    {
      name: "relationTo",
      type: "select",
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === "collection",
      },
      defaultValue: "posts",
      label: "Collections To Show",
      options: [
        {
          label: "Posts",
          value: "posts",
        },
        {
          label: "Pages",
          value: "pages",
        },
      ],
    },
    {
      name: "selectedDocs",
      type: "relationship",
      admin: {
        condition: (_, siblingData) => siblingData.populateBy === "selection",
      },
      hasMany: true,
      label: "Selection",
      relationTo: ["posts", "pages"],
    },
  ],
  labels: {
    plural: "Archives",
    singular: "Archive",
  },
};
