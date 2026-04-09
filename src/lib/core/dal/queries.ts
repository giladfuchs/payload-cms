import configPromise from "@payload-config";
import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";
import { getPayload as initPayload, type PayloadRequest } from "payload";

import type {
  Media,
  Page,
  Post,
  Redirect,
  SiteSetting,
  User,
} from "@/lib/core/types/payload-types";

import {
  AppConst,
  CollectionName,
  type SitemapData,
  type SitemapItem,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/utilities";

type PayloadInstance = Awaited<ReturnType<typeof initPayload>>;
type PayloadFindArgs = Parameters<PayloadInstance["find"]>[0];
type PayloadFindGlobalArgs = Parameters<PayloadInstance["findGlobal"]>[0];

export default class Queries {
  private static instance: PayloadInstance | null = null;

  static async getPayload() {
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

  static queryMediaByIds(ids: number[]): Promise<Media[]> {
    const uniqueIds = Array.from(new Set(ids)).sort((a, b) => a - b);

    if (!uniqueIds.length) {
      return Promise.resolve([]);
    }

    return Queries.cache(
      () =>
        Queries.runPayloadFind<Media>({
          collection: "media",
          tag: AppConst.CACHE_TAG_GENERAL,
          params: {
            depth: 0,
            limit: 0,
            pagination: false,
            where: {
              id: { in: uniqueIds },
            },
          },
        }),
      `media-${uniqueIds.join(",")}`,
      AppConst.CACHE_TAG_GENERAL,
    )();
  }

  static queryCollection<T>(collection: CollectionName): Promise<T[]> {
    return Queries.cache(
      () =>
        Queries.runPayloadFind<T>({
          collection,
          tag: AppConst.CACHE_TAG_GENERAL,
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
        }),
      `collection-${collection}`,
      AppConst.CACHE_TAG_GENERAL,
    )();
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

  static queryPostBySlug(slug: string): Promise<Post | null> {
    return Queries.getBySlug<Post>(CollectionName.posts, slug, 2, {
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
      relatedPosts: true,
      comments: true,
    });
  }

  static queryPageBySlug(slug: string): Promise<Page | null> {
    return Queries.getBySlug<Page>(CollectionName.pages, slug, 1, {
      slug: true,
      title: true,
      hero: true,
      layout: true,
      meta: true,
      updatedAt: true,
    });
  }

  private static fetchSlugs(
    collection: CollectionName,
  ): Promise<SitemapItem[]> {
    return Queries.cache(
      () =>
        Queries.runPayloadFind<SitemapItem>({
          collection,
          tag: `${AppConst.CACHE_TAG_SITEMAP}-${collection}`,
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
        }),
      `sitemap-${collection}`,
      AppConst.CACHE_TAG_SITEMAP,
    )();
  }

  static async querySitemapData(): Promise<SitemapData> {
    const [pages, posts] = await Promise.all([
      Queries.fetchSlugs(CollectionName.pages),
      Queries.fetchSlugs(CollectionName.posts),
    ]);

    return { pages, posts };
  }

  static querySiteSettings(): Promise<SiteSetting> {
    return Queries.cache(
      () =>
        Queries.runPayloadGlobal<SiteSetting>({
          tag: AppConst.CACHE_TAG_GENERAL,
          params: {
            slug: "site-settings",
            depth: 2,
          },
        }),
      "site-settings",
      AppConst.CACHE_TAG_GENERAL,
    )();
  }
}
