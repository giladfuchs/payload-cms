import { notFound } from "next/navigation";

import type { PropsSlug, MetaInput } from "@/lib/core/types/types";
import type { Blog, BlogComment } from "@/payload-types";
import type { Metadata } from "next";

import {
  BlogComments,
  RelatedArticles,
} from "@/components/blocks/blog-components";
import BlogHero from "@/components/blocks/heros/blog-hero";
import { JsonLdViewScript } from "@/components/shared/elements-ssr";
import RichText from "@/components/ui/rich-text";
import DAL from "@/lib/core/dal";
import { CollectionName } from "@/lib/core/types/types";
import { getDecodedSlug } from "@/lib/core/utilities";
import { buildMetadata } from "@/lib/seo/metadata";
export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);
  const article = (await DAL.queryBlogBySlug(slug)) as Blog;
  return buildMetadata({
    ...(article?.meta ?? {}),
    path: `${CollectionName.blog}/${slug}`,
    modifiedTime: article?.updatedAt,
  } as MetaInput);
}

export default async function BlogArticlePage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);

  const article = await DAL.queryBlogBySlug(slug);
  if (!article) return notFound();
  return (
    <article>
      <JsonLdViewScript collection={CollectionName.blog} entity={article} />
      <BlogHero article={article} />

      <div className="flex flex-col items-center gap-4 my-4">
        <div className="container">
          <RichText
            className="max-w-5xl lg:px-2 "
            data={article.content}
            enableGutter={false}
          />

          {article.relatedArticles && article.relatedArticles.length > 0 && (
            <RelatedArticles
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              articles={article.relatedArticles.filter(
                (related) => typeof related === "object",
              )}
            />
          )}

          <BlogComments
            comments={(article.comments?.docs ?? []) as BlogComment[]}
            blogId={article.id}
          />
        </div>
      </div>
    </article>
  );
}
