import configPromise from "@payload-config";
import { cacheLife, cacheTag } from "next/cache";
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
let payloadInstance: PayloadInstance | null = null;

export const getPayload = async () => {
  if (!payloadInstance) {
    payloadInstance = await initPayload({ config: configPromise });
  }
  return payloadInstance;
};

type PayloadQueryOptions = {
  tag: string;
  cache?: boolean;
};

type PayloadFindOptions = PayloadQueryOptions & {
  collection: PayloadFindArgs["collection"];
  params: Omit<PayloadFindArgs, "collection">;
};

type PayloadGlobalOptions = PayloadQueryOptions & {
  params: PayloadFindGlobalArgs;
};

const runPayloadFind = async <T>({
  collection,
  params,
  tag,
  cache = true,
}: PayloadFindOptions): Promise<T[]> => {
  if (!cache) {
    const payload = await getPayload();
    const res = await payload.find({
      collection,
      ...params,
    });

    return res.docs as T[];
  }

  const runCached = async (): Promise<T[]> => {
    "use cache";

    cacheLife("max");
    cacheTag(getRevalidateTag(tag));

    const payload = await getPayload();
    const res = await payload.find({
      collection,
      ...params,
    });

    return res.docs as T[];
  };

  return runCached();
};

const runPayloadGlobal = async <T>({
  params,
  tag,
  cache = true,
}: PayloadGlobalOptions): Promise<T> => {
  if (!cache) {
    return (await (await getPayload()).findGlobal(params)) as T;
  }

  const runCached = async (): Promise<T> => {
    "use cache";

    cacheLife("max");
    cacheTag(getRevalidateTag(tag));

    const payload = await getPayload();
    return (await payload.findGlobal(params)) as T;
  };

  return runCached();
};

export const queryCurrentUser = async (req: Request): Promise<User | null> => {
  try {
    const payload = await getPayload();

    const user = await payload.auth({
      req: req as unknown as PayloadRequest,
      headers: req.headers,
    });

    return (user?.user as User) ?? null;
  } catch {
    return null;
  }
};

export const queryMediaByIds = async (ids: number[]): Promise<Media[]> => {
  const uniqueIds = Array.from(new Set(ids)).sort((a, b) => a - b);

  if (!uniqueIds.length) {
    return [];
  }

  return runPayloadFind<Media>({
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
  });
};

export const queryCollection = async <T>(
  collection: CollectionName,
): Promise<T[]> =>
  runPayloadFind<T>({
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
  });

export const queryRedirectByFrom = async (
  from: string,
): Promise<Redirect | null> => {
  const docs = await runPayloadFind<Redirect>({
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
};

export const getBySlug = async <T>(
  collection: CollectionName,
  slug: string,
  depth = 0,
  select?: Record<string, true>,
): Promise<T | null> => {
  const { isEnabled: draft } = await draftMode();

  const docs = await runPayloadFind<T>({
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
};

export const queryPostBySlug = (slug: string): Promise<Post | null> =>
  getBySlug<Post>(CollectionName.posts, slug, 2, {
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

export const queryPageBySlug = (slug: string): Promise<Page | null> =>
  getBySlug<Page>(CollectionName.pages, slug, 1, {
    slug: true,
    title: true,
    hero: true,
    layout: true,
    meta: true,
    updatedAt: true,
  });

const fetchSlugs = async (collection: CollectionName): Promise<SitemapItem[]> =>
  runPayloadFind<SitemapItem>({
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
  });

export const querySitemapData = async (): Promise<SitemapData> => {
  const [pages, posts] = await Promise.all([
    fetchSlugs(CollectionName.pages),
    fetchSlugs(CollectionName.posts),
  ]);

  return { pages, posts };
};

export const querySiteSettings = async (): Promise<SiteSetting> =>
  runPayloadGlobal<SiteSetting>({
    tag: AppConst.CACHE_TAG_GENERAL,
    params: {
      slug: "site-settings",
      depth: 2,
    },
  });
