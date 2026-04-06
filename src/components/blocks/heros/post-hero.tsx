import { getTranslations } from "next-intl/server";

import type { Media, Post } from "@/payload-types";

import ImageVideo from "@/components/ui/image-video";
import { formatDate } from "@/lib/core/utilities";

export default async function PostHero({ post }: { post: Post }) {
  const t = await getTranslations("post");
  return (
    <div className="relative   flex items-end">
      <div className="container relative z-10 pb-8 text-white">
        <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{post.title}</h1>

        <div className="flex flex-row justify-between gap-4 md:justify-start md:gap-16">
          <div className="flex flex-col gap-1">
            <p className="text-sm">{t("author")}</p>
            <p>{post.author}</p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm">{t("publishedAt")}</p>
            <time dateTime={post.publishedAt!}>
              {formatDate.dayMonthYear(post.publishedAt!)}
            </time>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-sm">{t("readTime")}</p>
            <p>{t("minutes", { count: post.readTime })}</p>
          </div>
        </div>
      </div>

      <div className="min-h-[40vh] select-none">
        {post.heroImage && (
          <ImageVideo
            fill
            priority
            imgClassName="-z-10 object-cover"
            resource={post.heroImage as Media}
          />
        )}

        <div className="pointer-events-none absolute bottom-0 left-0 h-1/2 w-full bg-linear-to-t from-black to-transparent" />
      </div>
    </div>
  );
}
