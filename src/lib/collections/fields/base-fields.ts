import {
  MetaDescriptionField,
  MetaImageField,
  MetaTitleField,
  OverviewField,
  PreviewField,
} from "@payloadcms/plugin-seo/fields";
import {
  BlocksFeature,
  FixedToolbarFeature,
  HeadingFeature,
  HorizontalRuleFeature,
  InlineToolbarFeature,
  lexicalEditor,
  type LexicalEditorProps,
} from "@payloadcms/richtext-lexical";
import { slugField } from "payload";

import type { Access, AccessArgs, CollectionAdminOptions } from "payload";

import { Banner } from "@/components/blocks/Banner/config";
import { Code } from "@/components/blocks/Code/config";
import { MediaBlock } from "@/components/blocks/MediaBlock/config";
import appConfig from "@/lib/core/config";
import { User } from "@/lib/core/types/payload-types";
import { CollectionName } from "@/lib/core/types/types";

export const META_FIELD = {
  name: "meta",
  label: "SEO",
  fields: [
    OverviewField({
      titlePath: "meta.title",
      descriptionPath: "meta.description",
      imagePath: "meta.image",
    }),
    MetaTitleField({
      hasGenerateFn: true,
    }),
    MetaImageField({
      relationTo: "media",
      overrides: {
        required: true,
      },
    }),
    MetaDescriptionField({}),
    PreviewField({
      hasGenerateFn: true,
      titlePath: "meta.title",
      descriptionPath: "meta.description",
    }),
  ],
};

const pickString = (v: unknown): string => {
  if (typeof v === "string") return v;

  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;

    const he = obj.he;
    if (typeof he === "string" && he.trim()) return he;

    const en = obj.en;
    if (typeof en === "string" && en.trim()) return en;

    for (const val of Object.values(obj)) {
      if (typeof val === "string" && val.trim()) return val;
    }
  }

  return "";
};

const slugifyMixed = (input: unknown) => {
  const slug = pickString(input)
    .trim()
    .toLowerCase()
    .replace(/[\u0591-\u05C7]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return slug || undefined;
};
export const mixedSlugField = () =>
  slugField({
    useAsSlug: "title",
    slugify: slugifyMixed,
  });
export const BASE_VERSIONS = {
  drafts: {
    autosave: {
      interval: 100,
    },
    schedulePublish: true,
  },
  maxPerDoc: 50,
};

const baseFeatures: NonNullable<LexicalEditorProps["features"]> = ({
  rootFeatures,
}) => [
  ...rootFeatures,
  HeadingFeature({ enabledHeadingSizes: ["h1", "h2", "h3", "h4"] }),
  FixedToolbarFeature(),
  InlineToolbarFeature(),
];

export const BASE_RICH_TEXT_LIGHT = {
  type: "richText" as const,
  editor: lexicalEditor({
    features: baseFeatures,
  }),
};

export const BASE_RICH_TEXT = {
  type: "richText" as const,
  editor: lexicalEditor({
    features: (args) => [
      ...baseFeatures(args),
      BlocksFeature({ blocks: [Banner, Code, MediaBlock] }),
      HorizontalRuleFeature(),
    ],
  }),
};

export const RICH_TEXT_FIELD = {
  name: "content",
  ...BASE_RICH_TEXT,
  label: false,
  required: true,
};

export const generatePreviewPath = ({
  collection,
  slug,
}: {
  collection: CollectionName;
  slug: string;
}) => {
  if (!slug) {
    return null;
  }
  const encodedParams = new URLSearchParams({
    slug,
    collection,
    path:
      collection !== CollectionName.pages
        ? `/${collection}/${slug}`
        : `/${slug}`,
    previewSecret: appConfig.PREVIEW_SECRET,
  });
  return `/preview?${encodedParams.toString()}`;
};

export const makeAdminPreview = (
  collection: CollectionName,
): Pick<NonNullable<CollectionAdminOptions>, "livePreview" | "preview"> => ({
  livePreview: {
    url: ({ data }) =>
      generatePreviewPath({
        collection,
        slug: typeof data?.slug === "string" ? data.slug : "",
      }),
  },
  preview: (data) =>
    generatePreviewPath({
      collection,
      slug: typeof data?.slug === "string" ? data.slug : "",
    }),
});

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
  };
};
export const authenticated: (args: AccessArgs<User>) => boolean = ({
  req: { user },
}) => {
  return Boolean(user);
};
export const adminOnlyAccess = {
  read: authenticated,
  create: authenticated,
  update: authenticated,
  delete: authenticated,
  admin: authenticated,
};
