import type { Page } from "@/lib/core/types/payload-types";
import type { ReactNode } from "react";

import CMSLink from "@/components/ui/cms-link";
import ImageVideo from "@/components/ui/image-video";
import RichText from "@/components/ui/rich-text";
import { cn } from "@/lib/core/utilities";

type LowImpactHeroType = {
  children?: ReactNode;
  richText?: Page["hero"]["richText"];
};

export const LowImpactHero = ({ children, richText }: LowImpactHeroType) => {
  return (
    <div className="container">
      <div className="max-w-[48rem]">
        {children ? (
          children
        ) : richText ? (
          <RichText data={richText} enableGutter={false} />
        ) : null}
      </div>
    </div>
  );
};

const renderLinks = (
  links: NonNullable<Page["hero"]>["links"] = [],
  centered = false,
) => {
  if (!links || !links.length) return null;

  return (
    <ul className={cn("flex gap-4", centered && "md:justify-center")}>
      {links.map(({ link }, i) => (
        <li key={i}>
          <CMSLink {...link} />
        </li>
      ))}
    </ul>
  );
};

export const MediumImpactHero = ({ links, media, richText }: Page["hero"]) => {
  return (
    <div>
      <div className="container mb-8">
        {richText && (
          <RichText className="mb-6" data={richText} enableGutter={false} />
        )}
        {renderLinks(links)}
      </div>

      <div className="container">
        {media && typeof media === "object" && (
          <div>
            <ImageVideo
              className="-mx-4 md:-mx-8 2xl:-mx-16"
              imgClassName=""
              priority
              resource={media}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const HighImpactHero = ({ links, media, richText }: Page["hero"]) => {
  return (
    <div
      className="relative  flex items-center justify-center text-white"
      data-theme="dark"
    >
      <div className="container relative z-10 mb-8 flex items-center justify-center">
        <div className="max-w-[45rem]">
          {richText && (
            <RichText className="mb-6" data={richText} enableGutter={false} />
          )}
          {renderLinks(links, true)}
        </div>
      </div>

      <div className="min-h-[80vh] select-none">
        {media && typeof media === "object" && (
          <ImageVideo
            fill
            imgClassName="-z-10 object-cover"
            priority
            resource={media}
          />
        )}
      </div>
    </div>
  );
};
