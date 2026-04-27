import React from "react";

import type {
  Media,
  MediaBlock as MediaBlockProps,
} from "@/lib/core/types/payload-types";

import ImageVideo from "@/components/ui/image-video";
import { cn } from "@/lib/core/utilities";

type Props = MediaBlockProps & {
  breakout?: boolean;
  className?: string;
  enableGutter?: boolean;
  imgClassName?: string;
};

export const MediaBlock: React.FC<Props> = (props) => {
  const { className, enableGutter = true, imgClassName, media } = props;

  return (
    <div
      className={cn(
        "",
        {
          container: enableGutter,
        },
        className,
      )}
    >
      <ImageVideo
        imgClassName={cn("border border-border rounded-[0.8rem]", imgClassName)}
        resource={media as Media}
      />
    </div>
  );
};
