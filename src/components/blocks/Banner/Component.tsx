import React from "react";

import type { BannerBlock as BannerBlockProps } from "@/lib/core/types/payload-types";

import RichText from "@/components/ui/rich-text";
import { cn } from "@/lib/core/utilities";

type Props = {
  className?: string;
} & BannerBlockProps;

export const BannerBlock: React.FC<Props> = ({ className, content, style }) => {
  return (
    <div className={cn("mx-auto my-8 w-full", className)}>
      <div
        className={cn("border py-3 px-6 flex items-center rounded", {
          "border-border bg-card": style === "info",
          "border-error bg-error/30": style === "error",
          "border-success bg-success/30": style === "success",
          "border-warning bg-warning/30": style === "warning",
        })}
      >
        <RichText data={content} enableGutter={false} enableProse={false} />
      </div>
    </div>
  );
};
