import type { Block } from "payload";

export const Faqs: Block = {
  slug: "faqs",
  interfaceName: "FaqsBlock",
  fields: [
    {
      name: "title",
      label: "Title",
      type: "text",
      localized: true,
      required: true,
    },
    {
      name: "faqs",
      label: "FAQs",
      type: "array",
      labels: {
        singular: "FAQ",
        plural: "FAQs",
      },
      fields: [
        {
          name: "question",
          label: "Question",
          type: "text",
          required: true,
          localized: true,
        },
        {
          name: "answer",
          label: "Answer",
          type: "textarea",
          required: true,
          localized: true,
        },
      ],
    },
  ],
  labels: {
    singular: "FAQs",
    plural: "FAQs",
  },
};
