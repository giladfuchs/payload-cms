import Script from "next/script";
import { getTranslations } from "next-intl/server";

import type {
  GalleryBlock as GalleryBlockProps,
  GalleryMedia,
} from "@/payload-types";

import ImageVideo from "@/components/ui/image-video";
import appConfig from "@/lib/core/config";

export default async function GalleryBlock({
  title,
  images,
  id,
}: GalleryBlockProps) {
  const t = await getTranslations("blocks.gallery");
  const galleryImages = images
    .map(({ image }) => image)
    .filter(
      (image): image is GalleryMedia =>
        image !== null && typeof image === "object",
    );
  const canNavigate = galleryImages.length > 1;
  const galleryId = `gallery-${id}`;

  return (
    <section className="mx-auto max-w-3xl px-5">
      {title ? (
        <h2 className="mb-2 text-center text-2xl font-semibold">{title}</h2>
      ) : null}

      {galleryImages.length ? (
        <div id={galleryId} data-gallery dir={appConfig.LOCAL.dir}>
          <style>{`
            .gallery-radio {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip: rect(0, 0, 0, 0);
              white-space: nowrap;
              border: 0;
            }

            ${galleryImages
              .map(
                (_, index) => `
                  .gallery-radio-${index}:checked ~ .gallery-dots .gallery-dot-${index} {
                    width: 1.75rem;
                    background-color: var(--primary);
                  }

                  .gallery-radio-${index}:checked ~ .gallery-thumbs .gallery-thumb-${index} {
                    border-color: var(--primary);
                    box-shadow: 0 0 0 2px color-mix(in oklab, var(--primary) 25%, transparent);
                    opacity: 1;
                  }

                  .gallery-radio-${index}:focus-visible ~ .gallery-dots .gallery-dot-${index},
                  .gallery-radio-${index}:focus-visible ~ .gallery-thumbs .gallery-thumb-${index} {
                    outline: 2px solid var(--ring);
                    outline-offset: 2px;
                  }
                `,
              )
              .join("\n")}

            @media (min-width: 640px) {
              ${galleryImages
                .map(
                  (_, index) => `
                    #${galleryId}-radio-${index}:checked ~ .gallery-viewport .gallery-track {
                      transform: translate3d(${appConfig.LOCAL.isRtl ? index * 100 : index * -100}%, 0, 0);
                    }
                  `,
                )
                .join("\n")}
            }
          `}</style>

          {galleryImages.map((image, index) => (
            <input
              key={`${image.id}-radio-${index}`}
              id={`${galleryId}-radio-${index}`}
              name={galleryId}
              type="radio"
              defaultChecked={index === 0}
              aria-label={`${t("select_image")} ${index + 1}`}
              className={`gallery-radio gallery-radio-${index}`}
              data-gallery-radio
            />
          ))}

          <div
            dir={appConfig.LOCAL.dir}
            className="gallery-viewport relative aspect-[16/9] w-full snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-lg bg-card [scrollbar-width:none] sm:overflow-hidden [&::-webkit-scrollbar]:hidden"
            data-gallery-viewport
          >
            <div
              dir={appConfig.LOCAL.dir}
              className="gallery-track flex h-full w-full transition-transform duration-500 ease-in-out motion-reduce:transition-none"
              data-gallery-track
            >
              {galleryImages.map((image, index) => (
                <div
                  key={`${image.id}-slide-${index}`}
                  className="gallery-slide relative h-full min-w-full snap-center"
                  data-gallery-slide
                >
                  <ImageVideo
                    resource={image}
                    variant="gallery"
                    fill
                    className="relative h-full w-full"
                    imgClassName="object-cover"
                    videoClassName="h-full w-full object-cover"
                    priority={index === 0}
                    size="(max-width: 768px) 100vw, 768px"
                  />
                </div>
              ))}
            </div>
          </div>

          {canNavigate ? (
            <div
              role="group"
              aria-label={t("select_image")}
              className="gallery-dots mt-4 flex justify-center gap-6 sm:hidden"
            >
              {galleryImages.map((image, index) => (
                <label
                  key={`${image.id}-dot-${index}`}
                  htmlFor={`${galleryId}-radio-${index}`}
                  aria-label={`${t("select_image")} ${index + 1}`}
                  className={`gallery-dot gallery-dot-${index} h-2.5 w-2.5 cursor-pointer rounded-full bg-neutral-300 transition-all hover:bg-neutral-400 dark:bg-neutral-700 dark:hover:bg-neutral-600`}
                  data-gallery-select={index}
                />
              ))}
            </div>
          ) : null}

          {canNavigate ? (
            <div
              role="group"
              aria-label={t("select_image")}
              className="gallery-thumbs mt-4 hidden grid-cols-5 gap-3 sm:grid"
            >
              {galleryImages.map((image, index) => (
                <label
                  key={`${image.id}-thumbnail-${index}`}
                  htmlFor={`${galleryId}-radio-${index}`}
                  aria-label={`${t("select_image")} ${index + 1}`}
                  className={`gallery-thumb gallery-thumb-${index} group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-lg border-2 border-transparent bg-card opacity-70 transition hover:opacity-100`}
                  data-gallery-select={index}
                >
                  <ImageVideo
                    resource={image}
                    variant="gallery"
                    fill
                    className="pointer-events-none relative h-full w-full"
                    imgClassName="object-cover transition-transform duration-300 group-hover:scale-105"
                    videoClassName="h-full w-full object-cover"
                    size="144px"
                  />
                </label>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {canNavigate ? (
        <Script id="gallery-scroll-sync" strategy="afterInteractive">{`
          (() => {
            const initializeGalleries = () => {
              document.querySelectorAll("[data-gallery]").forEach((gallery) => {
                if (gallery.dataset.galleryReady === "true") return;

                const viewport = gallery.querySelector("[data-gallery-viewport]");
                const track = gallery.querySelector("[data-gallery-track]");
                const slides = Array.from(
                  gallery.querySelectorAll("[data-gallery-slide]"),
                );
                const radios = Array.from(
                  gallery.querySelectorAll("[data-gallery-radio]"),
                );
                const controls = Array.from(
                  gallery.querySelectorAll("[data-gallery-select]"),
                );

                if (!viewport || !track || slides.length < 2) return;
                gallery.dataset.galleryReady = "true";

                const selectImage = (index) => {
                  const radio = radios[index];
                  const slide = slides[index];
                  if (!radio || !slide) return;

                  radio.checked = true;

                  if (window.matchMedia("(max-width: 639px)").matches) {
                    track.style.transform = "none";
                    slide.scrollIntoView({
                      behavior: "smooth",
                      block: "nearest",
                      inline: "center",
                    });
                    return;
                  }

                  const isRtl = getComputedStyle(gallery).direction === "rtl";
                  const offset = (isRtl ? index : -index) * 100;
                  track.style.transform =
                    "translate3d(" + offset + "%, 0, 0)";
                };

                let animationFrame = 0;
                const syncSelectedImage = () => {
                  animationFrame = 0;
                  const viewportRect = viewport.getBoundingClientRect();
                  const viewportCenter =
                    viewportRect.left + viewportRect.width / 2;
                  let selectedIndex = 0;
                  let shortestDistance = Infinity;

                  slides.forEach((slide, index) => {
                    const slideRect = slide.getBoundingClientRect();
                    const slideCenter = slideRect.left + slideRect.width / 2;
                    const distance = Math.abs(slideCenter - viewportCenter);

                    if (distance < shortestDistance) {
                      shortestDistance = distance;
                      selectedIndex = index;
                    }
                  });

                  if (radios[selectedIndex]) radios[selectedIndex].checked = true;
                };

                viewport.addEventListener(
                  "scroll",
                  () => {
                    cancelAnimationFrame(animationFrame);
                    animationFrame = requestAnimationFrame(syncSelectedImage);
                  },
                  { passive: true },
                );

                radios.forEach((radio, index) => {
                  radio.addEventListener("change", () => {
                    if (radio.checked) selectImage(index);
                  });
                });

                controls.forEach((control) => {
                  control.addEventListener("click", (event) => {
                    event.preventDefault();
                    selectImage(Number(control.dataset.gallerySelect));
                  });
                });
              });
            };

            initializeGalleries();
            new MutationObserver(initializeGalleries).observe(document.body, {
              childList: true,
              subtree: true,
            });
          })();
        `}</Script>
      ) : null}
    </section>
  );
}
