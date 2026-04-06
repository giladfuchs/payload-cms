import type {
  SiteSetting,
  Page,
  Post,
  Media,
} from "@/lib/core/types/payload-types";

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

export type NavItemsProps = {
  navItems: NonNullable<NonNullable<SiteSetting["header"]>["navItems"]>;
};

export type CardDocData = {
  relationTo: CollectionName;
  value:
    | Pick<Post, "slug" | "meta" | "title">
    | Pick<Page, "slug" | "meta" | "title">;
};

export type SitemapItem = { slug: string; updatedAt: string };

export type SitemapData = {
  [CollectionName.pages]: SitemapItem[];
  [CollectionName.posts]: SitemapItem[];
};
export type MetaInput = {
  title: string;
  description: string;
  image: Media;
  path: string;
  modifiedTime?: string;
};
