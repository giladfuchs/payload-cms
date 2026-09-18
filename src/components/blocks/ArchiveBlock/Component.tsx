import { AutoScrollRow } from "@/components/shared/wrappers";
import Card from "@/components/ui/card";
import RichText from "@/components/ui/rich-text";
import {
  AppConst,
  type CardDocData,
  type ResolvedArchiveBlock,
} from "@/lib/core/types/types";

const cardKey = (item: CardDocData) => `${item.relationTo}-${item.value.slug}`;

const ArchiveCards = ({
  displayMode,
  items,
}: Pick<ResolvedArchiveBlock, "displayMode" | "items">) => {
  if (displayMode === "autoScroll") {
    return (
      <div className="container min-w-0">
        <ul className="sr-only">
          {items.map((item) => (
            <li key={cardKey(item)}>
              <Card doc={item} />
            </li>
          ))}
        </ul>
        <AutoScrollRow className="cursor-grab rounded-xl active:cursor-grabbing">
          {items.map((item) => (
            <div className={AppConst.CAROUSEL_ITEM_CLASS} key={cardKey(item)}>
              <Card
                className="h-full"
                doc={item}
                imageSizes={AppConst.CAROUSEL_ITEM_SIZES}
                tabIndex={-1}
              />
            </div>
          ))}
        </AutoScrollRow>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="grid grid-cols-4 gap-x-4 gap-y-4 sm:grid-cols-8 lg:grid-cols-12 lg:gap-x-8 lg:gap-y-8 xl:gap-x-8">
        {items.map((item) => (
          <div className="col-span-4" key={cardKey(item)}>
            <Card className="h-full" doc={item} />
          </div>
        ))}
      </div>
    </div>
  );
};

export function ArchiveBlock(props: ResolvedArchiveBlock & { id?: string }) {
  const { displayMode = "grid", id, introContent, items } = props;

  return (
    <section className="my-16 min-w-0" id={id ? `block-${id}` : undefined}>
      {introContent && (
        <div className="container mb-16">
          <RichText
            className="ms-0 max-w-[48rem]"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}

      <ArchiveCards items={items} displayMode={displayMode} />
    </section>
  );
}
