import type {
  ArchiveBlock as ArchiveBlockProps,
  Media,
  Page,
  Post,
} from "@/lib/core/types/payload-types";
import type { CardDocData, CollectionName } from "@/lib/core/types/types";

import Cards from "@/components/ui/cards";
import RichText from "@/components/ui/rich-text";
import { queryCollection, queryMediaByIds } from "@/lib/core/queries";

export async function ArchiveBlock(props: ArchiveBlockProps & { id?: string }) {
  const { id, introContent, relationTo, populateBy, selectedDocs } = props;

  let posts: CardDocData[] = [];

  if (populateBy === "collection") {
    posts = (
      await queryCollection<Post | Page>(relationTo as CollectionName)
    ).map((doc) => ({
      relationTo: relationTo as CollectionName,
      value: doc,
    }));
  } else if (selectedDocs?.length) {
    const docs = selectedDocs
      .map((doc) =>
        typeof doc.value === "object" && doc.value !== null
          ? { relationTo: doc.relationTo as CollectionName, value: doc.value }
          : null,
      )
      .filter(Boolean) as CardDocData[];

    const imageIds = docs
      .map((doc) => doc.value.meta?.image)
      .filter((image): image is number => typeof image === "number");

    const media = await queryMediaByIds(imageIds);
    const mediaById = new Map<number, Media>(
      media.map((item) => [Number(item.id), item]),
    );

    posts = docs.map((doc) => ({
      ...doc,
      value: {
        ...doc.value,
        meta: {
          ...doc.value.meta,
          image:
            typeof doc.value.meta?.image === "number"
              ? (mediaById.get(doc.value.meta.image) ?? doc.value.meta.image)
              : doc.value.meta?.image,
        },
      },
    }));
  }

  return (
    <div className="my-16" id={`block-${id}`}>
      {introContent && (
        <div className="container mb-16">
          <RichText
            className="ms-0 max-w-[48rem]"
            data={introContent}
            enableGutter={false}
          />
        </div>
      )}

      <Cards posts={posts} />
    </div>
  );
}
