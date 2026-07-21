import React from "react";

import type { HeroBasicBlock as HeroBasicBlockData } from "@/lib/core/types/payload-types";

import { Badge } from "@/components/ui/badge";
import CMSLink from "@/components/ui/cms-link";
import { cn } from "@/lib/core/utilities";

type Props = HeroBasicBlockData & {
  id?: string;
  className?: string;
  disableInnerContainer?: boolean;
};

export const HeroBasicBlock: React.FC<Props> = ({
  className,
  description,
  disableInnerContainer,
  eyebrow,
  id,
  links,
  proofItems,
  title,
}) => {
  return (
    <section
      className={cn("container", className)}
      id={id ? `block-${id}` : undefined}
    >
      <div className="overflow-hidden rounded-frame border border-border/70 bg-card/35 px-6 py-10 sm:px-8 lg:px-12 lg:py-14">
        <div
          className={cn("flex flex-col gap-8", {
            "mx-auto max-w-4xl": !disableInnerContainer,
          })}
        >
          <div className="flex flex-col gap-4">
            {eyebrow ? (
              <Badge
                variant="outline"
                className="w-fit rounded-full px-3 py-1 uppercase tracking-eyebrow"
              >
                {eyebrow}
              </Badge>
            ) : null}

            <div className="flex max-w-3xl flex-col gap-4">
              <h2 className="text-4xl font-medium tracking-display text-balance sm:text-5xl">
                {title}
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                {description}
              </p>
            </div>
          </div>

          {links && links.length > 0 ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              {links.map(({ link }, index) => (
                <CMSLink
                  key={index}
                  appearance={
                    link.appearance === "outline" ? "outline" : "default"
                  }
                  {...link}
                />
              ))}
            </div>
          ) : null}

          {proofItems && proofItems.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {proofItems.map(({ label }, index) => (
                <Badge
                  key={`${label}-${index}`}
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-sm"
                >
                  {label}
                </Badge>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
};
