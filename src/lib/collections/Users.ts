import type { CollectionConfig } from "payload";

import { adminOnlyAccess } from "@/lib/collections/fields/base-fields";

export const Users: CollectionConfig = {
  slug: "users",
  access: adminOnlyAccess,
  admin: {
    defaultColumns: ["name", "email"],
    useAsTitle: "name",
  },
  auth: true,
  fields: [
    {
      name: "name",
      type: "text",
    },
  ],
  timestamps: true,
};
