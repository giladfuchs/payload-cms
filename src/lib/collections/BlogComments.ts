import { revalidateTag } from "next/cache";

import type { CollectionConfig } from "payload";

import { adminOnlyAccess } from "@/lib/collections/fields/base-fields";
import { CollectionName } from "@/lib/core/types/types";

export const BlogComments: CollectionConfig = {
  slug: "blog-comments",
  labels: {
    singular: "Blog Comment",
    plural: "Blog Comments",
  },
  access: {
    ...adminOnlyAccess,
    read: () => true,
    create: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const blogId = typeof doc.blog === "object" ? doc.blog.id : doc.blog;
        if (!blogId) return;

        const blog = await req.payload.findByID({
          collection: CollectionName.blog,
          id: blogId,
          depth: 0,
          select: { slug: true },
        });
        try {
          revalidateTag(`${CollectionName.blog}-${blog.slug}`, "max");
        } catch {}
      },
    ],
  },
  admin: {
    useAsTitle: "authorName",
    group: "Content",
    defaultColumns: ["authorName", "blog", "createdAt"],
  },
  fields: [
    {
      name: "blog",
      type: "relationship",
      relationTo: CollectionName.blog,
      required: true,
      index: true,
    },
    {
      name: "authorName",
      type: "text",
      required: true,
    },
    {
      name: "authorEmail",
      type: "email",
      access: {
        read: ({ req }) => Boolean(req.user),
      },
    },
    {
      name: "body",
      type: "textarea",
      required: true,
    },
  ],
};
