import type { Block } from "payload";

export const Gallery: Block = {
  slug: "gallery",
  interfaceName: "GalleryBlock",
  fields: [
    {
      name: "images",
      type: "array",
      label: "Images",
      required: true,
      fields: [
        {
          name: "image",
          type: "upload",
          relationTo: "media",
          required: true,
        },
      ],
    },
  ],
  labels: {
    singular: "Gallery",
    plural: "Galleries",
  },
};
