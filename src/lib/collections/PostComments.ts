import { revalidateTag } from "next/cache";

import type { CollectionConfig } from "payload";

import { adminOnlyAccess } from "@/lib/collections/fields/base-fields";
import { CollectionName } from "@/lib/core/types/types";

export const PostComments: CollectionConfig = {
  slug: "post-comments",
  access: {
    ...adminOnlyAccess,
    read: () => true,
    create: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const postId = typeof doc.post === "object" ? doc.post.id : doc.post;
        if (!postId) return;

        const post = await req.payload.findByID({
          collection: CollectionName.posts,
          id: postId,
          depth: 0,
          select: { slug: true },
        });
        try {
          revalidateTag(`${CollectionName.posts}-${post.slug}`, "max");
        } catch {}
      },
    ],
  },
  admin: {
    useAsTitle: "authorName",
    group: "Content",
    defaultColumns: ["authorName", "post", "createdAt"],
  },
  fields: [
    {
      name: "post",
      type: "relationship",
      relationTo: CollectionName.posts,
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
    },
    {
      name: "body",
      type: "textarea",
      required: true,
    },
  ],
};
