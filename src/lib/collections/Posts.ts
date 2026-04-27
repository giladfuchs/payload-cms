import type { CollectionConfig, Field } from "payload";

import {
  RICH_TEXT_FIELD,
  adminOnlyAccess,
  makeAdminPreview,
  mixedSlugField,
  META_FIELD,
  authenticatedOrPublished,
  BASE_VERSIONS,
} from "@/lib/collections/fields/base-fields";
import { makeRevalidateHooks } from "@/lib/collections/hooks";
import { CollectionName } from "@/lib/core/types/types";

export const Posts: CollectionConfig = {
  slug: "posts",
  access: {
    ...adminOnlyAccess,
    read: authenticatedOrPublished,
  },
  admin: {
    defaultColumns: ["title", "slug", "author", "readTime", "updatedAt"],
    ...makeAdminPreview(CollectionName.posts),
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      type: "tabs",
      tabs: [
        {
          fields: [
            {
              name: "heroImage",
              type: "upload",
              relationTo: "media",
            },
            RICH_TEXT_FIELD as Field,
          ],
          label: "Content",
        },
        {
          fields: [
            {
              name: "comments",
              type: "join",
              collection: "post-comments",
              on: "post",
            },
            {
              name: "relatedPosts",
              type: "relationship",
              admin: {
                position: "sidebar",
              },
              filterOptions: ({ id }) => ({
                id: {
                  not_in: [id],
                },
              }),
              hasMany: true,
              relationTo: "posts",
            },
          ],
          label: "Meta",
        },
        META_FIELD,
      ],
    },
    {
      name: "publishedAt",
      type: "date",
      admin: {
        date: {
          pickerAppearance: "dayAndTime",
        },
        position: "sidebar",
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (siblingData._status === "published" && !value) {
              return new Date();
            }
            return value;
          },
        ],
      },
    },
    {
      name: "author",
      type: "text",
      admin: {
        position: "sidebar",
      },
      required: true,
    },
    {
      name: "readTime",
      type: "number",
      admin: {
        position: "sidebar",
        description: "Reading time in minutes",
      },
      min: 1,
      required: true,
    },
    mixedSlugField(),
  ],

  hooks: makeRevalidateHooks(CollectionName.posts),
  versions: BASE_VERSIONS,
};
