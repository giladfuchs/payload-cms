import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { seoPlugin } from "@payloadcms/plugin-seo";
import {
  FixedToolbarFeature,
  HeadingFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import { s3Storage } from "@payloadcms/storage-s3";

import type { Page, Post } from "@/lib/core/types/payload-types";
import type { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import type { Plugin } from "payload";

import {
  revalidateDeleteRedirects,
  revalidateRedirects,
} from "@/lib/collections/hooks";
import appConfig from "@/lib/core/config";
import { CollectionName } from "@/lib/core/types/types";

const generateTitle: GenerateTitle<Post | Page> = ({ doc }) => doc.title;

const generateURL: GenerateURL<Post | Page> = ({ doc }) =>
  doc?.slug ? `${appConfig.SERVER_URL}/${doc.slug}` : appConfig.SERVER_URL;

const formConfirmationEditor = lexicalEditor({
  features: ({ rootFeatures }) => [
    ...rootFeatures,
    FixedToolbarFeature(),
    HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
  ],
});

export const plugins: Plugin[] = [
  // R2 needs Cloudflare cache rules for caching

  ...(appConfig.R2_PUBLIC_URL
    ? [
        s3Storage({
          collections: {
            media: {
              disableLocalStorage: true,
              disablePayloadAccessControl: true,
              prefix: appConfig.R2_BUCKET_PREFIX,
              generateFileURL: ({ filename, prefix }) => {
                const key = prefix ? `${prefix}/${filename}` : filename;
                return `${appConfig.R2_PUBLIC_URL}/${key}`;
              },
            },
          },
          bucket: appConfig.R2_BUCKET,
          config: {
            endpoint: appConfig.R2_ENDPOINT,
            region: "auto",
            credentials: {
              accessKeyId: appConfig.R2_ACCESS_KEY_ID,
              secretAccessKey: appConfig.R2_SECRET_ACCESS_KEY,
            },
            forcePathStyle: true,
          },
        }),
      ]
    : []),
  redirectsPlugin({
    collections: [CollectionName.pages, CollectionName.posts],
    overrides: {
      // @ts-expect-error mapped redirect fields are broader than Payload infers here
      fields: ({ defaultFields }) =>
        defaultFields.map((field) =>
          "name" in field && field.name === "from"
            ? {
                ...field,
                admin: {
                  ...field.admin,
                  description:
                    "You will need to rebuild the website when changing this field.",
                },
              }
            : field,
        ),
      hooks: {
        afterChange: [revalidateRedirects],
        afterDelete: [revalidateDeleteRedirects],
      },
    },
  }),

  seoPlugin({
    generateTitle,
    generateURL,
  }),

  formBuilderPlugin({
    fields: {
      payment: false,
    },
    formOverrides: {
      fields: ({ defaultFields }) =>
        defaultFields.map((field) =>
          "name" in field && field.name === "confirmationMessage"
            ? {
                ...field,
                editor: formConfirmationEditor,
              }
            : field,
        ),
    },
    formSubmissionOverrides: {
      access: {
        create: () => true,
      },
    },
  }),
];
