import type { Field, Block } from "payload";

import { BASE_RICH_TEXT } from "@/lib/collections/fields/base-fields";
import { linkGroup } from "@/lib/collections/fields/linkGroup";

export const CallToAction: Block = {
  slug: "cta",
  interfaceName: "CallToActionBlock",
  fields: [
    {
      ...BASE_RICH_TEXT,
      label: false,
    } as Field,
    linkGroup({
      appearances: ["default", "outline"],
      overrides: {
        maxRows: 2,
      },
    }),
  ],
  labels: {
    plural: "Calls to Action",
    singular: "Call to Action",
  },
};
