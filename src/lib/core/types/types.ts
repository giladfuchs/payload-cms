import { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import type {
  Page,
  Blog,
  Media,
  SeoMedia,
  Redirect,
  SiteSetting,
  User,
  ArchiveBlock,
} from "@/payload-types";
import type { Form } from "@payloadcms/plugin-form-builder/types";

export enum CollectionName {
  blog = "blog",
  redirects = "redirects",
  pages = "pages",
}

export const AppConst = {
  CACHE_TAG_GENERAL: "general",
  CACHE_TAG_SITEMAP: "sitemap",
  POPUP_LAST_SHOWN_KEY: "POPUP_LAST_SHOWN_KEY",
  // Tailwind needs these as static literals to generate the arbitrary-value
  // classes, so keep both in sync by hand rather than interpolating a
  // shared breakpoint value.
  CAROUSEL_ITEM_CLASS:
    "min-w-0 flex-[0_0_86%] sm:flex-[0_0_48%] lg:flex-[0_0_32%]",
  CAROUSEL_ITEM_SIZES:
    "(max-width: 639px) 86vw, (max-width: 1023px) 48vw, 32vw",
} as const;

export type PropsSlug = { params: Promise<{ slug: string }> };

export type CardDocData = {
  relationTo: CollectionName;
  value:
    | Pick<Blog, "slug" | "meta" | "title">
    | Pick<Page, "slug" | "meta" | "title">;
};

export type ResolvedArchiveBlock = ArchiveBlock & { items: CardDocData[] };

export type ResolvedPageBlock =
  | Exclude<Page["layout"][number], { blockType: "archive" }>
  | ResolvedArchiveBlock;

export type ResolvedPage = Omit<Page, "layout"> & {
  layout: ResolvedPageBlock[];
};

export type MetaInput = {
  title: string;
  description: string;
  image: SeoMedia;
  path: string;
  modifiedTime?: string;
};

export type SitemapItem = { slug: string; updatedAt: string };

export type SitemapData = {
  [CollectionName.pages]: SitemapItem[];
  [CollectionName.blog]: SitemapItem[];
};

export type DalStatic = {
  queryCollection<T>(collection: CollectionName): Promise<T[]>;
  queryMediaByIds(ids: number[]): Promise<Media[]>;
  querySeoMediaByIds(ids: number[]): Promise<SeoMedia[]>;

  queryBlogBySlug(slug: string): Promise<Blog | null>;
  queryPageBySlug(slug: string): Promise<ResolvedPage | null>;
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
