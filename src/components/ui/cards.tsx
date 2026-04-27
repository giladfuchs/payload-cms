import type { CardDocData } from "@/lib/core/types/types";

import Card from "@/components/ui/card";

export default function Cards({ posts }: { posts: CardDocData[] }) {
  return (
    <div className="container">
      <div className="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-y-4 gap-x-4 lg:gap-y-8 lg:gap-x-8 xl:gap-x-8">
        {posts?.map((result, index) => {
          if (typeof result === "object" && result !== null) {
            return (
              <div className="col-span-4" key={index}>
                <Card className="h-full" doc={result} />
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
