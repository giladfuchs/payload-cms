import type { Field } from "payload";

/**
 * Shared editor fields for integration block variants.
 *
 * Keeping the schema in one place allows future layouts to reuse existing
 * Payload content while changing only the frontend presentation.
 */
export const integrationFields: Field[] = [
  {
    name: "heading",
    type: "text",
    required: true,
  },
  {
    name: "subtext",
    type: "textarea",
  },
  {
    name: "integrations",
    type: "array",
    required: true,
    minRows: 2,
    maxRows: 12,
    admin: {
      initCollapsed: true,
    },
    fields: [
      {
        name: "logo",
        type: "upload",
        relationTo: "media",
        required: true,
      },
      {
        name: "name",
        type: "text",
        required: true,
      },
      {
        name: "description",
        type: "textarea",
      },
      {
        name: "href",
        type: "text",
      },
    ],
  },
];
