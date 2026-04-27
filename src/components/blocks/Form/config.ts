import type { Block, Field } from "payload";

import { RICH_TEXT_FIELD } from "@/lib/collections/fields/base-fields";

export const FormBlock: Block = {
  slug: "formBlock",
  interfaceName: "FormBlock",
  fields: [
    {
      name: "form",
      type: "relationship",
      relationTo: "forms",
      required: true,
    },
    {
      name: "enableIntro",
      type: "checkbox",
      label: "Enable Intro Content",
    },
    {
      ...RICH_TEXT_FIELD,
      name: "introContent",
      admin: {
        condition: (_, { enableIntro }) => Boolean(enableIntro),
      },
      label: "Intro Content",
    } as Field,
  ],
  labels: {
    plural: "Form Blocks",
    singular: "Form Block",
  },
};
