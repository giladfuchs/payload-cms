import type { Block } from 'payload'

import { featureFields } from '@/blocks/shared/featureFields'
import { linkGroup } from "@/lib/collections/fields/linkGroup";
export const FeatureBento: Block = {
  slug: 'featureBento',
  // Existing apps must migrate stored data before adopting this identifier:
  // https://www.payload-components.xyz/docs/registry#installed-source-and-migrations
  dbName: 'pc_fea_ben',
  interfaceName: 'FeatureBentoBlock',
  fields: [
    // Shared feature core (eyebrow, title, description). Variant-specific fields
    // follow; edit the shared shape in @/blocks/shared/featureFields.
    ...featureFields,
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 3,
      maxRows: 6,
      admin: {
        initCollapsed: true,
        description: 'The first item leads the grid as the featured cell.',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'description',
          type: 'textarea',
          required: true,
        },
      ],
    },
    linkGroup({
      overrides: {
        admin: {
          initCollapsed: true,
        },
        maxRows: 1,
      },
    }),
  ],
  labels: {
    plural: 'Feature Bento Blocks',
    singular: 'Feature Bento',
  },
}
