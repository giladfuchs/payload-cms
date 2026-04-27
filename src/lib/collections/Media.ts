import path from "path";
import { fileURLToPath } from "url";

import type { CollectionConfig } from "payload";

import { adminOnlyAccess } from "@/lib/collections/fields/base-fields";
import { mediaTransformUploadHook } from "@/lib/collections/hooks";
import appConfig from "@/lib/core/config";

export const Media: CollectionConfig = {
  slug: "media",

  admin: {
    group: "Content",
  },

  access: {
    ...adminOnlyAccess,
    read: () => true,
  },

  hooks: {
    beforeChange: [mediaTransformUploadHook],
    afterError: [
      ({ error }) => {
        console.error("MEDIA UPLOAD ERROR:", error);
        throw error;
      },
    ],
  },

  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: Boolean(appConfig.R2_PUBLIC_URL)
    ? {
        focalPoint: true,
      }
    : {
        staticDir: path.resolve(
          path.dirname(fileURLToPath(import.meta.url)),
          "../../../public/media",
        ),
        focalPoint: true,
      },
};
