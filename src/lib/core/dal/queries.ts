import configPromise from "@payload-config";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { getPayload as initPayload, type PayloadRequest } from "payload";

import type {
  Media,
  SeoMedia,
  Page,
  Blog,
  Redirect,
  SiteSetting,
  User,
} from "@/payload-types";

import { resolvePageLayout } from "@/lib/core/dal/archive";
import {
  AppConst,
  CollectionName,
  type ResolvedPage,
  type SitemapData,
  type SitemapItem,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/utilities";

type PayloadInstance = Awaited<ReturnType<typeof initPayload>>;
type PayloadFindArgs = Parameters<PayloadInstance["find"]>[0];
type PayloadFindGlobalArgs = Parameters<PayloadInstance["findGlobal"]>[0];

export default class Queries {
  private static instance: PayloadInstance | null = null;

  private static async getPayload() {
    if (!Queries.instance) {
      Queries.instance = await initPayload({ config: configPromise });
    }
    return Queries.instance;
  }

  private static cache<T>(fn: () => Promise<T>, key: string, tag: string) {
    return unstable_cache(fn, [key], {
      revalidate: false,
      tags: [getRevalidateTag(tag)],
    });
  }

  private static async runPayloadFind<T>({
    collection,
    params,
    tag,
    cache = true,
  }: {
    collection: PayloadFindArgs["collection"];
    params: Omit<PayloadFindArgs, "collection">;
    tag: string;
    cache?: boolean;
  }): Promise<T[]> {
    if (!cache) {
      const payload = await Queries.getPayload();
      const res = await payload.find({
        collection,
        ...params,
      });

      return res.docs as T[];
    }

    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();
        const res = await payload.find({
          collection,
          ...params,
        });

        return res.docs as T[];
      },
      `${collection}-${tag}-${JSON.stringify(params)}`,
      tag,
    )();
  }

  private static async runPayloadGlobal<T>({
    params,
    tag,
    cache = true,
  }: {
    params: PayloadFindGlobalArgs;
    tag: string;
    cache?: boolean;
  }): Promise<T> {
    if (!cache) {
      return (await (await Queries.getPayload()).findGlobal(params)) as T;
    }

    return Queries.cache(
      async () => {
        const payload = await Queries.getPayload();
        return (await payload.findGlobal(params)) as T;
      },
      `global-${tag}-${JSON.stringify(params)}`,
      tag,
    )();
  }

  static async queryCurrentUser(req: Request): Promise<User | null> {
    try {
      const payload = await Queries.getPayload();

      const user = await payload.auth({
        req: req as unknown as PayloadRequest,
        headers: req.headers,
      });

      return (user?.user as User) ?? null;
    } catch {
      return null;
    }
  }

  private static queryByIds<T>(
    collection: PayloadFindArgs["collection"],
    ids: number[],
  ): Promise<T[]> {
    const uniqueIds = Array.from(new Set(ids)).sort((a, b) => a - b);

    if (!uniqueIds.length) {
      return Promise.resolve([]);
    }

    return Queries.runPayloadFind<T>({
      collection,
      tag: AppConst.CACHE_TAG_GENERAL,
      params: {
        depth: 0,
        limit: 0,
        pagination: false,
        where: {
          id: { in: uniqueIds },
        },
      },
    });
  }

  static queryMediaByIds(ids: number[]): Promise<Media[]> {
    return Queries.queryByIds<Media>("media", ids);
  }

  static querySeoMediaByIds(ids: number[]): Promise<SeoMedia[]> {
    return Queries.queryByIds<SeoMedia>("seo-media", ids);
  }

  static queryCollection<T>(collection: CollectionName): Promise<T[]> {
    return Queries.runPayloadFind<T>({
      collection,
      tag: AppConst.CACHE_TAG_SITEMAP,
      params: {
        depth: 1,
        limit: 0,
        pagination: false,
        sort: "-publishedAt",
        where: {
          _status: { equals: "published" },
        },
        select: {
          title: true,
          slug: true,
          meta: true,
        },
      },
    });
  }

  static async queryRedirectByFrom(from: string): Promise<Redirect | null> {
    const docs = await Queries.runPayloadFind<Redirect>({
      collection: CollectionName.redirects,
      tag: `${CollectionName.redirects}-${from}`,
      params: {
        limit: 1,
        pagination: false,
        depth: 1,
        select: {
          to: { url: true, reference: true },
        },
        where: {
          from: { equals: from },
        },
      },
    });

    return docs[0] ?? null;
  }

  private static async getBySlug<T>(
    collection: CollectionName,
    slug: string,
    depth = 0,
    select?: Record<string, true>,
  ): Promise<T | null> {
    const { isEnabled: draft } = await draftMode();

    const docs = await Queries.runPayloadFind<T>({
      collection,
      tag: `${collection}-${slug}`,
      cache: !draft,
      params: {
        draft,
        overrideAccess: draft,
        depth,
        limit: 1,
        pagination: false,
        where: {
          and: [
            { slug: { equals: slug } },
            ...(draft ? [] : [{ _status: { equals: "published" } }]),
          ],
        },
        ...(select ? { select } : {}),
      },
    });

    return docs[0] ?? null;
  }

  static queryBlogBySlug(slug: string): Promise<Blog | null> {
    return Queries.getBySlug<Blog>(CollectionName.blog, slug, 2, {
      slug: true,
      title: true,
      heroImage: true,
      content: true,
      meta: true,
      author: true,
      readTime: true,
      publishedAt: true,
      createdAt: true,
      updatedAt: true,
      relatedArticles: true,
      comments: true,
    });
  }

  static async queryPageBySlug(slug: string): Promise<ResolvedPage | null> {
    const page = await Queries.getBySlug<Page>(CollectionName.pages, slug, 1, {
      slug: true,
      title: true,
      hero: true,
      layout: true,
      meta: true,
      createdAt: true,
      updatedAt: true,
    });

    if (!page) return null;

    return { ...page, layout: await resolvePageLayout(page.layout, Queries) };
  }

  private static fetchSlugs(
    collection: CollectionName,
  ): Promise<SitemapItem[]> {
    return Queries.runPayloadFind<SitemapItem>({
      collection,
      tag: AppConst.CACHE_TAG_SITEMAP,
      params: {
        limit: 0,
        pagination: false,
        sort: "-updatedAt",
        depth: 0,
        where: {
          _status: { equals: "published" },
        },
        select: {
          slug: true,
          updatedAt: true,
        },
      },
    });
  }

  static async querySitemapData(): Promise<SitemapData> {
    const [pages, blog] = await Promise.all([
      Queries.fetchSlugs(CollectionName.pages),
      Queries.fetchSlugs(CollectionName.blog),
    ]);

    return { pages, blog };
  }

  static querySiteSettings(): Promise<SiteSetting> {
    return Queries.runPayloadGlobal<SiteSetting>({
      tag: AppConst.CACHE_TAG_GENERAL,
      params: {
        slug: "site-settings",
        depth: 2,
      },
    });
  }
}
