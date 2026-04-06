import type { Post, Media, SiteSetting } from "@/lib/core/types/payload-types";
import type { Metadata } from "next";

import { JsonLd } from "@/components/shared/elements-ssr";
import Cards from "@/components/ui/cards";
import { querySiteSettings, queryCollection } from "@/lib/core/queries";
import { CollectionName, type MetaInput } from "@/lib/core/types/types";
import {
  generateJsonLdBreadcrumbsPosts,
  generateJsonLdPostsPage,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await querySiteSettings();

  return buildMetadata({
    ...(settings.meta! as MetaInput),
    path: CollectionName.posts,
  });
}

export default async function PostsPage() {
  const [posts, settings]: [Post[], SiteSetting] = await Promise.all([
    queryCollection<Post>(CollectionName.posts),
    querySiteSettings(),
  ]);

  return (
    <section className="py-1">
      <JsonLd
        data={[
          generateJsonLdPostsPage({
            ...(settings.meta! as {
              title: string;
              description: string;
              image: Media;
            }),
            posts,
          }),
          generateJsonLdBreadcrumbsPosts(),
        ]}
      />

      <div className="container max-w-none">
        <h1>{settings.meta!.title}</h1>
        <h2 className="my-3 text-muted-foreground">
          {settings.meta!.description}
        </h2>
      </div>

      <Cards
        posts={posts.map((doc) => ({
          relationTo: CollectionName.posts,
          value: doc,
        }))}
      />
    </section>
  );
}
