import type { ContentBlock as ContentBlockProps } from "@/lib/core/types/payload-types";

import CMSLink from "@/components/ui/cms-link";
import RichText from "@/components/ui/rich-text";
import { cn } from "@/lib/core/utilities";

const colsSpanClasses = {
  full: "12",
  half: "6",
  oneThird: "4",
  twoThirds: "8",
};

export default function ContentBlock({ columns }: ContentBlockProps) {
  return (
    <div className="container my-2">
      <div className="grid grid-cols-4 gap-x-16 gap-y-8 lg:grid-cols-12">
        {columns?.map((col, index) => (
          <div
            key={index}
            className={cn(
              `col-span-4 lg:col-span-${colsSpanClasses[col.size!]}`,
              {
                "md:col-span-2": col.size !== "full",
              },
            )}
          >
            {col.richText && (
              <RichText data={col.richText} enableGutter={false} />
            )}

            {col.enableLink && col.link && <CMSLink {...col.link} />}
          </div>
        ))}
      </div>
    </div>
  );
}
