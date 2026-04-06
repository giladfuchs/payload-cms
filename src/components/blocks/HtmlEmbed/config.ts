import type { Block } from "payload";

export const HtmlEmbed: Block = {
  slug: "htmlEmbed",
  interfaceName: "HtmlEmbedBlock",
  fields: [
    {
      name: "contentHtml",
      label: "HTML",
      type: "code",
      required: true,
      admin: {
        language: "html",
      },
    },
  ],
  labels: {
    singular: "HTML Embed",
    plural: "HTML Embeds",
  },
};
