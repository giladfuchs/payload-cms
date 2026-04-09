import { unstable_cache } from "next/cache";
import { draftMode } from "next/headers";

import type {
  Media,
  Page,
  Post,
  Redirect,
  SiteSetting,
  User,
} from "@/lib/core/types/payload-types";

import appConfig from "@/lib/core/config";
import {
  AppConst,
  CollectionName,
  type SitemapData,
  type SitemapItem,
} from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/utilities";

type FetchApiOptions = {
  tag?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  select?: Record<string, true | Record<string, true>>;
  expect?: "docs" | "first" | "json";
  req?: Request;
};

export default class Api {
  private static cache<T>(fn: () => Promise<T>, key: string, tag: string) {
    return unstable_cache(fn, [key], {
      revalidate: false,
      tags: [getRevalidateTag(tag)],
    });
  }

  private static buildApiUrl(
    path: string,
    params?: Record<string, string | number | boolean | null | undefined>,
    select?: Record<string, true | Record<string, true>>,
  ) {
    const qs = new URLSearchParams();

    qs.set("pagination", "false");

    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        qs.set(key, String(value));
      }
    }

    if (select) {
      for (const [key, value] of Object.entries(select)) {
        if (value === true) {
          qs.set(`select[${key}]`, "true");
          continue;
        }

        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          if (!nestedValue) continue;
          qs.set(`select[${key}][${nestedKey}]`, "true");
        }
      }
    }

    if (!qs.has("limit")) {
      qs.set("limit", "100");
    }

    return `${appConfig.SERVER_URL}/api/${path}${qs.toString() ? `?${qs.toString()}` : ""}`;
  }

  private static async parseApiResponse<T>(
    res: Response,
    url: string,
    expect?: "docs" | "first" | "json",
  ): Promise<T> {
    if (!res.ok) {
      throw new Error(`fetchApi failed: ${res.status} ${url}`);
    }

    const json = await res.json();

    if (expect === "json") {
      return json as T;
    }

    if (expect === "first") {
      return (json.docs?.[0] ?? null) as T;
    }

    return (json.docs ?? []) as T;
  }

  private static async fetchApi<T>(
    path: string,
    { tag, params, select, expect, req }: FetchApiOptions = {},
  ): Promise<T> {
    const url = Api.buildApiUrl(path, params, select);
    const cookie = req?.headers.get("cookie") ?? "";

    if (!tag) {
      const res = await fetch(url, {
        cache: "no-store",
        headers: cookie ? { cookie } : undefined,
      });

      return Api.parseApiResponse<T>(res, url, expect);
    }

    const key = `${path}-${expect ?? "docs"}-${JSON.stringify(params ?? {})}-${JSON.stringify(select ?? {})}`;

    const res = await fetch(url, {
      cache: "force-cache",
      next: {
        tags: [getRevalidateTag(tag)],
      },
    });

    return Api.parseApiResponse<T>(res, key, expect);
  }

  static async queryCurrentUser(req: Request): Promise<User | null> {
    try {
      return await Api.fetchApi<User | null>("users/me", {
        expect: "json",
        req,
      });
    } catch {
      return null;
    }
  }

  static queryMediaByIds(ids: number[]): Promise<Media[]> {
    const uniqueIds = Array.from(new Set(ids)).sort((a, b) => a - b);

    if (!uniqueIds.length) {
      return Promise.resolve([]);
    }

    return Api.cache(
      () =>
        Api.fetchApi<Media[]>("media", {
          params: {
            depth: 0,
            limit: 0,
            "where[id][in]": uniqueIds.join(","),
          },
          expect: "docs",
          tag: AppConst.CACHE_TAG_GENERAL,
        }),
      `media-${uniqueIds.join(",")}`,
      AppConst.CACHE_TAG_GENERAL,
    )();
  }

  static queryCollection<T>(collection: CollectionName): Promise<T[]> {
    return Api.cache(
      () =>
        Api.fetchApi<T[]>(`${collection}`, {
          params: {
            depth: 1,
            limit: 0,
            sort: "-publishedAt",
            "where[_status][equals]": "published",
          },
          select: {
            title: true,
            slug: true,
            meta: true,
          },
          expect: "docs",
          tag: AppConst.CACHE_TAG_GENERAL,
        }),
      `collection-${collection}`,
      AppConst.CACHE_TAG_GENERAL,
    )();
  }

  static async queryRedirectByFrom(from: string): Promise<Redirect | null> {
    return Api.fetchApi<Redirect | null>(`${CollectionName.redirects}`, {
      params: {
        depth: 1,
        limit: 1,
        "where[from][equals]": from,
      },
      select: {
        to: {
          url: true,
          reference: true,
        },
      },
      expect: "first",
      tag: `${CollectionName.redirects}-${from}`,
    });
  }

  private static async getBySlug<T>(
    collection: CollectionName,
    slug: string,
    depth = 0,
    select?: Record<string, true>,
  ): Promise<T | null> {
    const { isEnabled: draft } = await draftMode();

    const params: Record<string, string | number | boolean> = {
      depth,
      limit: 1,
      draft: draft ? "true" : "false",
      "where[and][0][slug][equals]": slug,
    };

    if (!draft) {
      params["where[and][1][_status][equals]"] = "published";
    }

    return Api.fetchApi<T | null>(`${collection}`, {
      params,
      select,
      expect: "first",
      ...(draft ? {} : { tag: `${collection}-${slug}` }),
    });
  }

  static queryPostBySlug(slug: string): Promise<Post | null> {
    return Api.getBySlug<Post>(CollectionName.posts, slug, 2, {
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
    return Api.getBySlug<Page>(CollectionName.pages, slug, 1, {
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
    return Api.cache(
      () =>
        Api.fetchApi<SitemapItem[]>(`${collection}`, {
          params: {
            depth: 0,
            limit: 0,
            sort: "-updatedAt",
            "where[_status][equals]": "published",
          },
          select: {
            slug: true,
            updatedAt: true,
          },
          expect: "docs",
          tag: `${AppConst.CACHE_TAG_SITEMAP}-${collection}`,
        }),
      `sitemap-${collection}`,
      AppConst.CACHE_TAG_SITEMAP,
    )();
  }

  static async querySitemapData(): Promise<SitemapData> {
    const [pages, posts] = await Promise.all([
      Api.fetchSlugs(CollectionName.pages),
      Api.fetchSlugs(CollectionName.posts),
    ]);

    return { pages, posts };
  }

  static querySiteSettings(): Promise<SiteSetting> {
    return Api.cache(
      () =>
        Api.fetchApi<SiteSetting>("globals/site-settings", {
          params: {
            depth: 2,
          },
          expect: "json",
          tag: AppConst.CACHE_TAG_GENERAL,
        }),
      "site-settings",
      AppConst.CACHE_TAG_GENERAL,
    )();
  }
}
