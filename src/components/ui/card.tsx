import Link from "next/link";

import type { SeoMedia } from "@/payload-types";

import ImageVideo from "@/components/ui/image-video";
import appConfig from "@/lib/core/config";
import { type CardDocData, CollectionName } from "@/lib/core/types/types";
import { cn } from "@/lib/core/utilities";

export default function Card({
  className,
  doc,
  imageSizes = "33vw",
  tabIndex,
}: {
  className?: string;
  doc: CardDocData;
  imageSizes?: string;
  tabIndex?: number;
}) {
  const { relationTo, value } = doc;
  const { slug, meta, title } = value || {};
  const { description, image } = meta || {};

  const href =
    relationTo === CollectionName.pages
      ? `/${slug === appConfig.HOME_SLUG ? "" : slug}`
      : `/${relationTo}/${slug}`;

  return (
    <article
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        className,
      )}
    >
      <Link href={href} className="block" tabIndex={tabIndex}>
        <div className="relative w-full">
          <ImageVideo
            resource={image as SeoMedia}
            size={imageSizes}
            variant="card"
          />
        </div>

        <div className="p-4">
          <h3 className="font-semibold">{title}</h3>

          <div className="mt-2">
            <p>{description}</p>
          </div>
        </div>
      </Link>
    </article>
  );
}
