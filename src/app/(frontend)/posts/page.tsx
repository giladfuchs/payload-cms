import type { Post } from "@/payload-types";
import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/elements-ssr";
import Cards from "@/components/ui/cards";
import DAL from "@/lib/core/dal";
import { CollectionName, type MetaInput } from "@/lib/core/types/types";
import {
  generateJsonLdBreadcrumbsPosts,
  generateJsonLdPostsPage,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await DAL.querySiteSettings();
  const meta = settings.meta as MetaInput;

  return buildMetadata({
    ...meta,
    path: CollectionName.posts,
  });
}

export default async function PostsPage() {
  const [posts, settings] = await Promise.all([
    DAL.queryCollection<Post>(CollectionName.posts),
    DAL.querySiteSettings(),
  ]);

  const meta = settings.meta as MetaInput;

  return (
    <>
      <JsonLd
        data={[
          generateJsonLdPostsPage({
            ...meta,
            posts,
          }),
          generateJsonLdBreadcrumbsPosts(),
        ]}
      />

      <section className="container mx-2 py-8">
        <h1 className="text-center text-[2.5rem] font-bold leading-tight">
          {meta.title}
        </h1>

        <h2 className="mx-auto mt-[1rem] max-w-[42rem] text-center text-[1.125rem] leading-[1.7] text-gray-600 md:text-[1.25rem]">
          {meta.description}
        </h2>

        <Cards
          posts={posts.map((post) => ({
            relationTo: CollectionName.posts,
            value: post,
          }))}
        />
      </section>
    </>
  );
}
