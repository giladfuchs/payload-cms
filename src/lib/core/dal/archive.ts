import type {
  CardDocData,
  CollectionName,
  ResolvedArchiveBlock,
  ResolvedPageBlock,
} from "@/lib/core/types/types";
import type { Blog, Page, SeoMedia } from "@/payload-types";

type ArchiveDal = {
  queryCollection<T>(collection: CollectionName): Promise<T[]>;
  querySeoMediaByIds(ids: number[]): Promise<SeoMedia[]>;
};

const resolveArchiveItems = async (
  block: Pick<
    ResolvedArchiveBlock,
    "populateBy" | "relationTo" | "selectedDocs"
  >,
  dal: ArchiveDal,
): Promise<CardDocData[]> => {
  const { populateBy, relationTo, selectedDocs } = block;

  if (populateBy === "collection") {
    return (
      await dal.queryCollection<Blog | Page>(relationTo as CollectionName)
    ).map((doc) => ({
      relationTo: relationTo as CollectionName,
      value: doc,
    }));
  }

  if (!selectedDocs?.length) return [];

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

  const media = await dal.querySeoMediaByIds(imageIds);
  const mediaById = new Map<number, SeoMedia>(
    media.map((item) => [Number(item.id), item]),
  );

  return docs.map((doc) => ({
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
};

export const resolvePageLayout = (
  layout: Page["layout"],
  dal: ArchiveDal,
): Promise<ResolvedPageBlock[]> =>
  Promise.all(
    layout.map(async (block) =>
      block.blockType === "archive"
        ? { ...block, items: await resolveArchiveItems(block, dal) }
        : block,
    ),
  );
