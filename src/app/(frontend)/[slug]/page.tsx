import type { Page } from "@/lib/core/types/payload-types";
import type { PropsSlug, MetaInput } from "@/lib/core/types/types";
import type { Metadata } from "next";

import { RenderHero } from "@/components/blocks/heros/RenderHero";
import RenderBlocks from "@/components/blocks/RenderBlocks";
import { JsonLd, PayloadRedirects } from "@/components/shared/elements-ssr";
import appConfig from "@/lib/core/config";
import { queryPageBySlug } from "@/lib/core/queries";
import { getDecodedSlug } from "@/lib/core/utilities";
import {
  generateJsonLdBreadcrumbsPage,
  generateJsonLdPage,
} from "@/lib/seo/jsonld";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: PropsSlug): Promise<Metadata> {
  const slug = await getDecodedSlug(params);
  const page = (await queryPageBySlug(slug)) as Page;
  return buildMetadata({
    ...page.meta,
    path: slug === appConfig.HOME_SLUG ? "" : slug,
  } as MetaInput);
}

export default async function PagePage({ params }: PropsSlug) {
  const slug = await getDecodedSlug(params);
  const page = await queryPageBySlug(slug);
  if (!page) {
    return <PayloadRedirects url={slug} />;
  }
  return (
    <article className="py-1">
      <JsonLd
        data={[generateJsonLdPage(page), generateJsonLdBreadcrumbsPage(page)]}
      />
      <h1 className="sr-only">{page.title}</h1>
      <RenderHero {...page.hero} />
      <RenderBlocks blocks={page.layout} />
    </article>
  );
}
