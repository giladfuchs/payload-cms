import type { IntegrationGridBlock as IntegrationGridBlockData } from "@/lib/core/types/payload-types";

import ImageVideo from "@/components/ui/image-video";
import { cn } from "@/lib/core/utilities";

type Props = IntegrationGridBlockData & {
  id?: string;
  className?: string;
  disableInnerContainer?: boolean;
};

export function IntegrationGridBlock({
  className,
  disableInnerContainer,
  heading,
  id,
  integrations,
  subtext,
}: Props) {
  return (
    <section
      className={cn("container", className)}
      id={id ? `block-${id}` : undefined}
    >
      <div className="overflow-hidden rounded-xl border bg-card px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div
          className={cn("flex flex-col gap-12", {
            "mx-auto max-w-5xl": !disableInnerContainer,
          })}
        >
          <div className="flex flex-col gap-4 text-center">
            <h2 className="text-balance text-2xl font-semibold sm:text-3xl">
              {heading}
            </h2>
            {subtext ? (
              <p className="mx-auto max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base">
                {subtext}
              </p>
            ) : null}
          </div>

          {integrations?.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {integrations.map((item, index) => (
                <article
                  className="flex flex-col gap-5 rounded-xl border bg-background p-6"
                  key={item.id ?? `${item.name}-${index}`}
                >
                  <div className="flex size-11 items-center justify-center rounded-lg border bg-card">
                    {typeof item.logo === "object" && item.logo ? (
                      <ImageVideo
                        resource={item.logo}
                        imgClassName="size-6 w-auto object-contain"
                      />
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-2">
                    <h3 className="text-base font-medium">{item.name}</h3>
                    {item.description ? (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {item.description}
                      </p>
                    ) : null}
                  </div>

                  {item.href ? (
                    <div className="mt-auto border-t border-dashed pt-5">
                      <a
                        className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                        href={item.href}
                      >
                        Learn more
                        <span aria-hidden="true">&rarr;</span>
                      </a>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
