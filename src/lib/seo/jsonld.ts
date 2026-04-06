import type {
  FaqsBlock,
  Media,
  Page,
  Post,
} from "@/lib/core/types/payload-types";

import appConfig from "@/lib/core/config";
import { CollectionName } from "@/lib/core/types/types";
import { extractRichTextText, resolveMediaUrl } from "@/lib/core/utilities";

export const generateJsonLdPage = (page: Page) => {
  const url = `${appConfig.BASE_URL}/${page.slug === appConfig.HOME_SLUG ? "" : page.slug}`;
  const image = resolveMediaUrl(page.meta.image as Media);

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    name: page.meta?.title ?? page.title,
    description: page.meta?.description,
    url,
    image,
    dateModified: page.updatedAt,
    inLanguage: appConfig.LOCAL.lang,
  };
};

export const generateJsonLdBreadcrumbsPage = (page: Page) => {
  const isHome = page.slug === appConfig.HOME_SLUG;
  const url = isHome
    ? appConfig.BASE_URL
    : `${appConfig.BASE_URL}/${page.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumbs`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: appConfig.BASE_URL,
      },
      ...(isHome
        ? []
        : [
            {
              "@type": "ListItem",
              position: 2,
              name: page.meta?.title ?? page.title,
              item: url,
            },
          ]),
    ],
  };
};
export const generateJsonLdPost = (post: Post) => {
  const url = `${appConfig.BASE_URL}/${CollectionName.posts}/${post.slug}`;
  const image = resolveMediaUrl(post.meta?.image as Media);
  const content = extractRichTextText(post.content);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.meta?.title ?? post.title,
    description: post.meta?.description,
    url,
    image,
    articleBody: content,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    dateCreated: post.createdAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${url}#webpage`,
    },
    author: {
      "@type": "Person",
      name: post.author,
    },
    commentCount: post.comments?.docs?.length ?? 0,
    inLanguage: appConfig.LOCAL.lang,
    wordCount: content?.split(" ").length,
    publisher: {
      "@type": "Organization",
      name: appConfig.SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${appConfig.BASE_URL}/android-chrome-512x512.png`,
      },
    },
  };
};

export const generateJsonLdBreadcrumbsPost = (post: Post) => {
  const postsUrl = `${appConfig.BASE_URL}/${CollectionName.posts}`;
  const url = `${postsUrl}/${post.slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumbs`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: appConfig.BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Posts",
        item: postsUrl,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.meta?.title ?? post.title,
        item: url,
      },
    ],
  };
};

export const generateJsonLdPostsPage = ({
  title,
  description,
  image,
  posts,
}: {
  title: string;
  description: string;
  image: Media;
  posts: Post[];
}) => {
  const url = `${appConfig.BASE_URL}/${CollectionName.posts}`;

  const itemListElement = posts.map((post, index) => {
    const pUrl = `${url}/${post.slug}`;

    return {
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "BlogPosting",
        "@id": `${pUrl}#article`,
        headline: post.meta!.title,
        description: post.meta!.description,
        url: pUrl,
        image: resolveMediaUrl(post.meta!.image as Media),
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${url}#webpage`,
        name: title,
        description,
        url,
        image: resolveMediaUrl(image),
        inLanguage: appConfig.LOCAL.lang,
        hasPart: { "@id": `${url}#itemlist` },
      },
      {
        "@type": "ItemList",
        "@id": `${url}#itemlist`,
        name: title,
        description,
        url,
        numberOfItems: posts.length,
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        itemListElement,
      },
    ],
  };
};

export const generateJsonLdBreadcrumbsPosts = () => {
  const url = `${appConfig.BASE_URL}/${CollectionName.posts}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${url}#breadcrumbs`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: appConfig.BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Posts",
        item: url,
      },
    ],
  };
};

export const generateJsonLdFaq = (faqs: FaqsBlock["faqs"], title: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    name: `${title} FAQ`,
    mainEntity: faqs!.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
};
