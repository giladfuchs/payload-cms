import { getTranslations } from "next-intl/server";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";

import type { Media } from "@/lib/core/types/payload-types";

import ImageVideo from "@/components/ui/image-video";
import appConfig from "@/lib/core/config";

export default async function GalleryBlock({
  images,
}: {
  images: { image: Media }[];
}) {
  const t = await getTranslations("blocks.gallery");
  const canNavigate = images.length > 1;

  return (
    <div className="mx-auto max-w-3xl px-5">
      <style>{`
    .gallery-radio {
      position: fixed;
      opacity: 0;
      pointer-events: none;
    }

    .gallery-main-item,
    .gallery-prev-label,
    .gallery-next-label {
      display: none;
    }

    ${images
      .map(
        (_, i) => `
        #gallery-radio-${i}:checked ~ .gallery-main .gallery-main-item-${i} {
          display: block;
        }
        #gallery-radio-${i}:checked ~ .gallery-thumbs .gallery-thumb-${i} {
          border-width: 2px;
          border-color: rgb(37 99 235);
        }
      `,
      )
      .join("\n")}

    ${
      canNavigate
        ? images
            .map((_, i) => {
              const prevIndex = i - 1 < 0 ? images.length - 1 : i - 1;
              const nextIndex = i + 1 > images.length - 1 ? 0 : i + 1;

              return `
              #gallery-radio-${i}:checked ~ .gallery-main .gallery-prev-${appConfig.LOCAL.isRtl ? nextIndex : prevIndex} {
                display: inline-flex;
              }
              #gallery-radio-${i}:checked ~ .gallery-main .gallery-next-${appConfig.LOCAL.isRtl ? prevIndex : nextIndex} {
                display: inline-flex;
              }
            `;
            })
            .join("\n")
        : ""
    }
  `}</style>

      {images.map((item, i) => (
        <input
          key={`${item.image.id}-radio-${i}`}
          id={`gallery-radio-${i}`}
          name="gallery"
          type="radio"
          defaultChecked={i === 0}
          className="gallery-radio"
        />
      ))}

      <div className="gallery-main relative mb-6 w-full overflow-hidden aspect-[16/9]">
        {images.map((item, i) => (
          <div
            key={`${item.image.id}-main-${i}`}
            className={`gallery-main-item gallery-main-item-${i} h-full`}
          >
            <ImageVideo
              resource={item.image}
              className="h-full w-full"
              imgClassName="h-full w-full rounded-lg object-cover"
            />
          </div>
        ))}

        {canNavigate && (
          <div
            dir="ltr"
            className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center"
          >
            <div className="pointer-events-auto flex items-center gap-4">
              {images.map((item, i) => (
                <label
                  key={`${item.image.id}-prev-${i}`}
                  htmlFor={`gallery-radio-${i}`}
                  className={`gallery-prev-label gallery-prev-${i} inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-secondary text-neutral-600 hover:text-blue-500`}
                  aria-label={t("previous")}
                >
                  <HiChevronLeft className="h-5 w-5" />
                </label>
              ))}

              {images.map((item, i) => (
                <label
                  key={`${item.image.id}-next-${i}`}
                  htmlFor={`gallery-radio-${i}`}
                  className={`gallery-next-label gallery-next-${i} inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border bg-secondary text-neutral-600 hover:text-blue-500`}
                  aria-label={t("next")}
                >
                  <HiChevronRight className="h-5 w-5" />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="gallery-thumbs w-full">
        <div className="-mx-4 flex flex-wrap">
          {images.map((item, i) => (
            <div
              key={`${item.image.id}-${i}`}
              className="basis-1/5 pl-4 pt-4 max-[900px]:basis-1/4 max-[640px]:basis-1/3 max-[420px]:basis-1/2"
            >
              <label
                htmlFor={`gallery-radio-${i}`}
                aria-label={t("select_image")}
                className={`gallery-thumb-${i} block w-full cursor-pointer overflow-hidden rounded-lg border border-neutral-200`}
              >
                <ImageVideo
                  resource={item.image}
                  className="w-full"
                  imgClassName="h-20 w-full object-cover transition duration-300 hover:scale-105"
                />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
