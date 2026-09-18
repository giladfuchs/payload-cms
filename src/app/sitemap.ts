import type { MetadataRoute } from "next";

import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";
import { CollectionName } from "@/lib/core/types/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const { pages, blog } = await DAL.querySitemapData();

    const result: MetadataRoute.Sitemap = [];

    const home = pages.find((p) => p.slug === appConfig.HOME_SLUG);

    if (home) {
      result.push({
        url: `${appConfig.BASE_URL}/`,
        lastModified: home.updatedAt,
      });
    }

    result.push(
      ...pages
        .filter((p) => p.slug !== appConfig.HOME_SLUG)
        .map((p) => ({
          url: `${appConfig.BASE_URL}/${encodeURIComponent(p.slug)}`,
          lastModified: p.updatedAt,
        })),
    );

    result.push(
      ...blog.map((article) => ({
        url: `${appConfig.BASE_URL}/${CollectionName.blog}/${encodeURIComponent(article.slug)}`,
        lastModified: article.updatedAt,
      })),
    );

    return result;
  } catch {
    return [];
  }
}
