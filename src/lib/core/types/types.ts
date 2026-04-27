import { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import type {
  Page,
  Post,
  Media,
  Redirect,
  SiteSetting,
  User,
} from "@/lib/core/types/payload-types";
import type { Form } from "@payloadcms/plugin-form-builder/types";

export enum CollectionName {
  posts = "posts",
  redirects = "redirects",
  pages = "pages",
}

export const AppConst = {
  CACHE_TAG_GENERAL: "general",
  CACHE_TAG_SITEMAP: "sitemap",
  POPUP_LAST_SHOWN_KEY: "POPUP_LAST_SHOWN_KEY",
} as const;

export type PropsSlug = { params: Promise<{ slug: string }> };

export type CardDocData = {
  relationTo: CollectionName;
  value:
    | Pick<Post, "slug" | "meta" | "title">
    | Pick<Page, "slug" | "meta" | "title">;
};

export type MetaInput = {
  title: string;
  description: string;
  image: Media;
  path: string;
  modifiedTime?: string;
};

export type SitemapItem = { slug: string; updatedAt: string };

export type SitemapData = {
  [CollectionName.pages]: SitemapItem[];
  [CollectionName.posts]: SitemapItem[];
};

export type DalStatic = {
  queryCollection<T>(collection: CollectionName): Promise<T[]>;
  queryMediaByIds(ids: number[]): Promise<Media[]>;

  queryPostBySlug(slug: string): Promise<Post | null>;
  queryPageBySlug(slug: string): Promise<Page | null>;
  queryRedirectByFrom(from: string): Promise<Redirect | null>;

  querySiteSettings(): Promise<SiteSetting>;
  querySitemapData(): Promise<SitemapData>;
  queryCurrentUser(req: Request): Promise<User | null>;
};

export type FormBlockProps = {
  id?: string;
  blockName?: string;
  blockType?: "formBlock";
  enableIntro: boolean;
  form: Form;
  introContent?: DefaultTypedEditorState;
  submitUrl?: string;
  submitData?: Record<string, unknown>;
  refreshOnSubmit?: boolean;
};
