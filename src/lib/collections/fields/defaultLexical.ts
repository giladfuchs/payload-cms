import {
  BoldFeature,
  IndentFeature,
  ItalicFeature,
  lexicalEditor,
  LinkFeature,
  OrderedListFeature,
  ParagraphFeature,
  UnderlineFeature,
  UnorderedListFeature,
  EXPERIMENTAL_TableFeature,
  type LinkFields,
} from "@payloadcms/richtext-lexical";

import type { TextFieldSingleValidation } from "payload";

import { CollectionName } from "@/lib/core/types/types";

export const defaultLexical = lexicalEditor({
  features: [
    ParagraphFeature(),
    UnderlineFeature(),
    BoldFeature(),
    ItalicFeature(),
    OrderedListFeature(),
    UnorderedListFeature(),
    IndentFeature(),
    EXPERIMENTAL_TableFeature(),
    LinkFeature({
      enabledCollections: [CollectionName.pages, CollectionName.posts],
      fields: ({ defaultFields }) => {
        const defaultFieldsWithoutUrl = defaultFields.filter((field) => {
          if ("name" in field && field.name === "url") return false;
          return true;
        });

        return [
          ...defaultFieldsWithoutUrl,
          {
            name: "url",
            type: "text",
            admin: {
              condition: (_data, siblingData) =>
                siblingData?.linkType !== "internal",
            },
            label: ({ t }) => t("fields:enterURL"),
            required: true,
            validate: ((value, options) => {
              if (
                (options?.siblingData as LinkFields)?.linkType === "internal"
              ) {
                return true;
              }

              return value ? true : "URL is required";
            }) as TextFieldSingleValidation,
          },
        ];
      },
    }),
  ],
});
