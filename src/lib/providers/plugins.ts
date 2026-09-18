import { formBuilderPlugin } from "@payloadcms/plugin-form-builder";
import { redirectsPlugin } from "@payloadcms/plugin-redirects";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { s3Storage } from "@payloadcms/storage-s3";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";

import type { Blog, Page } from "@/payload-types";
import type { GenerateTitle, GenerateURL } from "@payloadcms/plugin-seo/types";
import type { Plugin } from "payload";

import { fullLexical } from "@/lib/collections/fields/base-fields";
import {
  revalidateDeleteRedirects,
  revalidateRedirects,
} from "@/lib/collections/hooks";
import appConfig from "@/lib/core/config";
import { CollectionName } from "@/lib/core/types/types";
import { adminTranslationsPlugin } from "@/lib/intl/admin";

const generateTitle: GenerateTitle<Blog | Page> = ({ doc }) => doc.title;

const generateURL: GenerateURL<Blog | Page> = ({ collectionConfig, doc }) => {
  if (!doc?.slug) return appConfig.BASE_URL;

  const path =
    collectionConfig?.slug === CollectionName.blog
      ? `${CollectionName.blog}/${doc.slug}`
      : doc.slug;

  return `${appConfig.BASE_URL}/${path}`;
};

let storagePlugin: Plugin | undefined;

if (appConfig.STORAGE_PROVIDER === "vercel") {
  storagePlugin = vercelBlobStorage({
    enabled: !!appConfig.BLOB_READ_WRITE_TOKEN,
    token: appConfig.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: true,
    collections: {
      media: {
        prefix: appConfig.BUCKET_PREFIX,
        ...(appConfig.STORAGE_URL ? { disablePayloadAccessControl: true } : {}),
      },
    },
  });
} else if (appConfig.STORAGE_PROVIDER === "s3") {
  storagePlugin = s3Storage({
    collections: {
      media: {
        disableLocalStorage: true,
        disablePayloadAccessControl: true,
        prefix: appConfig.BUCKET_PREFIX,
        generateFileURL: ({ filename, prefix }) => {
          const key = prefix ? `${prefix}/${filename}` : filename;
          return `${appConfig.STORAGE_URL}/${key}`;
        },
      },
    },
    bucket: appConfig.S3_BUCKET,
    config: {
      endpoint: appConfig.S3_ENDPOINT,
      region: "auto",
      credentials: {
        accessKeyId: appConfig.S3_ACCESS_KEY_ID,
        secretAccessKey: appConfig.S3_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    },
  });
}
export const plugins: Plugin[] = [
  ...(storagePlugin ? [storagePlugin] : []),
  redirectsPlugin({
    collections: [CollectionName.pages, CollectionName.blog],
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
                editor: fullLexical,
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
  adminTranslationsPlugin,
];
