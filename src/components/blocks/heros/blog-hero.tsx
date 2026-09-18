import { getTranslations } from "next-intl/server";

import type { Blog, Media } from "@/payload-types";

import ImageVideo from "@/components/ui/image-video";
import { formatDate } from "@/lib/core/utilities";

export default async function BlogHero({ article }: { article: Blog }) {
  const t = await getTranslations("blog");
  return (
    <div className="relative max-w-5xl mx-auto  flex items-end">
      <div className="container relative z-10 pb-8 text-white">
        <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">
          {article.title}
        </h1>

        <div className="flex flex-row justify-between gap-4 md:justify-start md:gap-16">
          <div className="flex flex-col gap-1">
            <p className="text-sm">{t("author")}</p>
            <p>{article.author}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm">{t("publishedAt")}</p>
            <time dateTime={article.publishedAt!}>
              {formatDate.dayMonthYear(article.publishedAt!)}
            </time>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm">{t("readTime")}</p>
            <p>{t("minutes", { count: article.readTime })}</p>
          </div>
        </div>
      </div>

      <div className="min-h-[40vh] select-none">
        {article.heroImage && (
          <ImageVideo
            fill
            priority
            imgClassName="-z-10 object-cover"
            resource={article.heroImage as Media}
          />
        )}

        <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-black to-transparent" />
      </div>
    </div>
  );
}
