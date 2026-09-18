import type {
  Blog,
  FaqsBlock,
  Media,
  Page,
  SeoMedia,
  SiteSetting,
} from "@/payload-types";

import appConfig from "@/lib/core/config";
import {
  CollectionName,
  type CardDocData,
  type ResolvedArchiveBlock,
  type ResolvedPage,
} from "@/lib/core/types/types";
import {
  extractRichTextText,
  getSizedVariant,
  resolveMediaUrl,
  type MediaVariant,
} from "@/lib/core/utilities";

type JsonLdNode = Record<string, unknown>;
type JsonLdCollection = CollectionName.pages | CollectionName.blog;
type PageJsonLdEntity = Page | ResolvedPage;

const SCHEMA_CONTEXT = "https://schema.org";
const siteUrl = new URL("/", appConfig.BASE_URL).toString();
const organizationId = `${siteUrl}#organization`;
const websiteId = `${siteUrl}#website`;

const createGraph = (...nodes: Array<JsonLdNode | undefined>) => ({
  "@context": SCHEMA_CONTEXT,
  "@graph": nodes.filter((node): node is JsonLdNode => Boolean(node)),
});

const createAbsoluteUrl = (path: string) =>
  new URL(path.replace(/^\/+/, ""), siteUrl).toString();

// Relations come back populated: every DAL query for these entities uses enough
// depth, and the SEO tab's image/title/description fields are required, so this
// never sees an unpopulated ID or a missing image.
const createImageObject = (
  value: Media | SeoMedia | number,
  variant?: MediaVariant,
): JsonLdNode | undefined => {
  if (!value) return undefined;
  const media = value as Media | SeoMedia;
  const sized = getSizedVariant(media, variant);
  const url = new URL(resolveMediaUrl(media, variant), siteUrl).toString();
  return {
    "@type": "ImageObject",
    "@id": `${url}#image`,
    url,
    contentUrl: url,
    caption: media.alt,
    width: sized?.width ?? media.width,
    height: sized?.height ?? media.height,
  };
};

const createBreadcrumbs = (
  url: string,
  items: Array<{ name: string; url: string }>,
): JsonLdNode => ({
  "@type": "BreadcrumbList",
  "@id": `${url}#breadcrumbs`,
  itemListElement: [{ name: "Home", url: siteUrl }, ...items].map(
    (item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    }),
  ),
});

const getBlogIndexUrl = () => createAbsoluteUrl(CollectionName.blog);

const getBlogArticleUrl = (slug: string) =>
  createAbsoluteUrl(`${CollectionName.blog}/${encodeURIComponent(slug)}`);

const getPageUrl = (slug: string) =>
  slug === appConfig.HOME_SLUG ? siteUrl : createAbsoluteUrl(slug);

const createPersonNode = (name?: string | null): JsonLdNode => ({
  "@type": "Person",
  name,
});

const createBlogPostingNode = (
  article: Blog,
  url: string,
  title: string,
): JsonLdNode => ({
  "@type": "BlogPosting",
  "@id": `${url}#article`,
  url,
  headline: article.title,
  ...(title !== article.title ? { alternativeHeadline: title } : {}),
  description: article.meta.description,
  image: createImageObject(article.meta.image, "og"),
  datePublished: article.publishedAt || article.createdAt,
  dateModified: article.updatedAt,
  author: createPersonNode(article.author),
  publisher: { "@id": organizationId },
});

const createItemListNode = ({
  description,
  id,
  items,
  name,
  order = "https://schema.org/ItemListUnordered",
  url,
}: {
  description?: string;
  id: string;
  items: Array<{ item: JsonLdNode; url: string }>;
  name: string;
  order?: string;
  url: string;
}): JsonLdNode => ({
  "@type": "ItemList",
  "@id": id,
  name,
  ...(description ? { description } : {}),
  url,
  numberOfItems: items.length,
  itemListOrder: order,
  itemListElement: items.map((entry, index) => ({
    "@type": "ListItem",
    position: index + 1,
    url: entry.url,
    item: entry.item,
  })),
});

const createCardNode = ({ relationTo, value }: CardDocData) => {
  const isBlogArticle = relationTo === CollectionName.blog;
  const url = isBlogArticle
    ? getBlogArticleUrl(value.slug)
    : getPageUrl(value.slug);
  const image =
    typeof value.meta.image === "object"
      ? createImageObject(value.meta.image, "og")
      : undefined;

  return {
    url,
    item: {
      "@type": isBlogArticle ? "BlogPosting" : "WebPage",
      "@id": `${url}#${isBlogArticle ? "article" : "webpage"}`,
      url,
      name: value.meta.title,
      headline: value.title,
      description: value.meta.description,
      image,
      ...(isBlogArticle
        ? { publisher: { "@id": organizationId } }
        : { isPartOf: { "@id": websiteId } }),
    },
  };
};

const isResolvedArchiveBlock = (
  block: PageJsonLdEntity["layout"][number],
): block is ResolvedArchiveBlock =>
  block.blockType === "archive" &&
  "items" in block &&
  Array.isArray(block.items);

const getResolvedArchiveBlocks = (
  page: PageJsonLdEntity,
): ResolvedArchiveBlock[] => {
  const archiveBlocks: ResolvedArchiveBlock[] = [];

  for (const block of page.layout) {
    if (isResolvedArchiveBlock(block) && block.items.length > 0) {
      archiveBlocks.push(block);
    }
  }

  return archiveBlocks;
};

const createArchiveItemLists = (page: PageJsonLdEntity, pageUrl: string) => {
  const archiveBlocks = getResolvedArchiveBlocks(page);

  return archiveBlocks.map((block, index) => {
    const intro = extractRichTextText(block.introContent);
    const listSuffix = archiveBlocks.length > 1 ? `-${index + 1}` : "";

    return createItemListNode({
      id: `${pageUrl}#itemlist${listSuffix}`,
      items: block.items.map(createCardNode),
      name: intro || page.title,
      url: pageUrl,
    });
  });
};

const createPageJsonLd = (page: PageJsonLdEntity) => {
  const isHome = page.slug === appConfig.HOME_SLUG;
  const url = getPageUrl(page.slug);
  const title = page.meta.title;
  const image = createImageObject(page.meta.image, "og");
  const archiveItemLists = createArchiveItemLists(page, url);
  const archiveReferences = archiveItemLists.map((list) => ({
    "@id": list["@id"],
  }));
  const breadcrumbs = isHome
    ? undefined
    : createBreadcrumbs(url, [{ name: title, url }]);

  return createGraph(
    {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: title,
      headline: page.title,
      description: page.meta.description,
      datePublished: page.createdAt,
      dateModified: page.updatedAt,
      inLanguage: appConfig.LOCAL.lang,
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      image,
      primaryImageOfPage: image,
      ...(archiveReferences.length
        ? {
            mainEntity:
              archiveReferences.length === 1
                ? archiveReferences[0]
                : archiveReferences,
          }
        : {}),
      ...(breadcrumbs ? { breadcrumb: { "@id": `${url}#breadcrumbs` } } : {}),
    },
    ...archiveItemLists,
    breadcrumbs,
  );
};

const createBlogArticleJsonLd = (article: Blog) => {
  const url = getBlogArticleUrl(article.slug);
  const title = article.meta.title;
  const image = createImageObject(article.meta.image, "og");
  const content = extractRichTextText(article.content);
  const webpageId = `${url}#webpage`;
  const breadcrumbs = createBreadcrumbs(url, [
    { name: "Blog", url: getBlogIndexUrl() },
    { name: title, url },
  ]);
  const articleNode = createBlogPostingNode(article, url, title);

  return createGraph(
    {
      ...articleNode,
      inLanguage: appConfig.LOCAL.lang,
      isAccessibleForFree: true,
      mainEntityOfPage: { "@id": webpageId },
      timeRequired: `PT${article.readTime}M`,
      ...(content
        ? {
            articleBody: content,
            wordCount: content.split(/\s+/u).length,
          }
        : {}),
      commentCount:
        article.comments?.totalDocs ?? article.comments?.docs?.length ?? 0,
    },
    {
      "@type": "WebPage",
      "@id": webpageId,
      url,
      name: title,
      description: article.meta.description,
      datePublished: article.publishedAt || article.createdAt,
      dateModified: article.updatedAt,
      inLanguage: appConfig.LOCAL.lang,
      isPartOf: { "@id": websiteId },
      about: { "@id": organizationId },
      mainEntity: { "@id": articleNode["@id"] },
      breadcrumb: { "@id": `${url}#breadcrumbs` },
      primaryImageOfPage: image,
    },
    breadcrumbs,
  );
};

export const createJsonLdByModel = (
  collection: JsonLdCollection,
  entity: PageJsonLdEntity | Blog,
) => {
  if (collection === CollectionName.pages) {
    return createPageJsonLd(entity as PageJsonLdEntity);
  }

  return createBlogArticleJsonLd(entity as Blog);
};

export const createJsonLdSite = (settings: SiteSetting) => {
  const logo = createImageObject(settings.general.logo);
  const sameAs = [
    settings.footer?.instagram,
    settings.footer?.facebook,
    settings.footer?.tiktok,
    settings.footer?.linkedin,
    settings.footer?.youtube,
    settings.footer?.x,
  ].filter(
    (url): url is string =>
      typeof url === "string" && /^https?:\/\//i.test(url),
  );

  return createGraph(
    {
      "@type": "Organization",
      "@id": organizationId,
      name: appConfig.SITE_NAME,
      url: siteUrl,
      logo,
      image: logo,
      ...(settings.footer?.email ? { email: settings.footer.email } : {}),
      ...(settings.footer?.phone ? { telephone: settings.footer.phone } : {}),
      ...(sameAs.length ? { sameAs } : {}),
    },
    {
      "@type": "WebSite",
      "@id": websiteId,
      url: siteUrl,
      name: appConfig.SITE_NAME,
      inLanguage: appConfig.LOCAL.lang,
      publisher: { "@id": organizationId },
    },
  );
};

export const createJsonLdFaq = (faqs: FaqsBlock["faqs"], title: string) => ({
  "@context": SCHEMA_CONTEXT,
  "@type": "FAQPage",
  ...(title ? { name: `${title} FAQ` } : {}),
  mainEntity: (faqs ?? []).map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
});
