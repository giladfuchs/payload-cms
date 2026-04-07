import { notFound } from "next/navigation";

import type { Post, PostComment } from "@/lib/core/types/payload-types";
import type { PropsSlug, MetaInput } from "@/lib/core/types/types";
import type { Metadata } from "next";

import PostHero from "@/components/blocks/heros/post-hero";
import {
  RelatedPosts,
  PostComments,
} from "@/components/blocks/posts-components";
import { JsonLd } from "@/components/shared/elements-ssr";
import RichText from "@/components/ui/rich-text";
import { queryPostBySlug } from "@/lib/core/queries";
import { CollectionName } from "@/lib/core/types/types";
import { getDecodedSlug } from "@/lib/core/utilities";
import {
  generateJsonLdBreadcrumbsPost,
  generateJsonLdPost,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);
  const post = (await queryPostBySlug(slug)) as Post;
  return buildMetadata({
    ...(post?.meta ?? {}),
    path: `${CollectionName.posts}/${slug}`,
    modifiedTime: post?.updatedAt,
  } as MetaInput);
}

export default async function PostPage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);

  const post = await queryPostBySlug(slug);
  if (!post) return notFound();
  return (
    <article>
      <JsonLd
        data={[generateJsonLdPost(post), generateJsonLdBreadcrumbsPost(post)]}
      />
      <PostHero post={post} />

      <div className="flex flex-col items-center gap-4 my-4">
        <div className="container">
          <RichText
            className="max-w-5xl lg:px-2 "
            data={post.content}
            enableGutter={false}
          />

          {post.relatedPosts && post.relatedPosts.length > 0 && (
            <RelatedPosts
              className="mt-12 max-w-[52rem] lg:grid lg:grid-cols-subgrid col-start-1 col-span-3 grid-rows-[2fr]"
              posts={post.relatedPosts.filter((p) => typeof p === "object")}
            />
          )}

          <PostComments
            comments={(post.comments?.docs ?? []) as PostComment[]}
            postId={post.id}
          />
        </div>
      </div>
    </article>
  );
}
