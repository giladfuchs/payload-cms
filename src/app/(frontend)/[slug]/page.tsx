import type { PropsSlug, MetaInput } from "@/lib/core/types/types";
import type { Page } from "@/payload-types";
import type { Metadata } from "next";

import { RenderHero } from "@/components/blocks/heros/RenderHero";
import RenderBlocks from "@/components/blocks/RenderBlocks";
import {
  JsonLdViewScript,
  PayloadRedirects,
} from "@/components/shared/elements-ssr";
import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";
import { CollectionName } from "@/lib/core/types/types";
import { getDecodedSlug } from "@/lib/core/utilities";
import { buildMetadata } from "@/lib/seo/metadata";

export const dynamic = "force-static";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);
  const page = (await DAL.queryPageBySlug(slug)) as Page;
  return buildMetadata({
    ...(page?.meta ?? {}),
    path: slug === appConfig.HOME_SLUG ? "" : slug,
  } as MetaInput);
}

export default async function PagePage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);
  const page = await DAL.queryPageBySlug(slug);
  if (!page) {
    return <PayloadRedirects url={slug} />;
  }
  return (
    <article className="py-1">
      <JsonLdViewScript collection={CollectionName.pages} entity={page} />
      <h1 className="sr-only">{page.title}</h1>
      <RenderHero {...page.hero} />
      <RenderBlocks blocks={page.layout} />
    </article>
  );
}
