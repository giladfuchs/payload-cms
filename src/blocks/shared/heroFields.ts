import type { Field } from "payload";

import { linkGroup } from "@/lib/collections/fields/linkGroup";

/**
 * Shared field core for the Hero component family.
 *
 * Every hero variant spreads these fields first and then appends its own
 * variant-specific ones. Editing the
 * shared headline/eyebrow/description/CTA shape here updates every installed
 * hero block at once, so the family never drifts field-by-field across a repo.
 *
 * Installed once per repo at `src/blocks/shared/heroFields.ts`; re-running
 * `payload-components add hero-*` never overwrites a copy you have already edited.
 */
export const heroFields: Field[] = [
  {
    name: "eyebrow",
    type: "text",
  },
  {
    name: "title",
    type: "text",
    required: true,
  },
  {
    name: "description",
    type: "textarea",
    required: true,
  },
  linkGroup({
    overrides: {
      admin: {
        initCollapsed: true,
      },
      maxRows: 2,
      minRows: 1,
    },
  }),
];
