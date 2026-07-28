import type { Block } from "payload";

import { integrationFields } from "@/blocks/shared/integrationFields";

export const IntegrationGrid: Block = {
  slug: "integrationGrid",
  dbName: "pc_int_gri",
  interfaceName: "IntegrationGridBlock",
  fields: [...integrationFields],
  labels: {
    plural: "Integration Grid Blocks",
    singular: "Integration Grid",
  },
};
