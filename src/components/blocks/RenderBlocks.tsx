import type { Page } from "@/lib/core/types/payload-types";

import { ArchiveBlock } from "@/components/blocks/ArchiveBlock/Component";
import { CallToActionBlock } from "@/components/blocks/CallToAction/Component";
import ContentBlock from "@/components/blocks/Content/Component";
import FaqBlock from "@/components/blocks/Faqs/Component";
import GalleryBlock from "@/components/blocks/Gallery/Component";
import HtmlEmbedBlock from "@/components/blocks/HtmlEmbed/Component";
import { MediaBlock } from "@/components/blocks/MediaBlock/Component";
import { FormBlock } from "@/components/shared/wrappers";
import RichText from "@/components/ui/rich-text";

const blockComponents = {
  archive: ArchiveBlock,
  content: ContentBlock,
  cta: CallToActionBlock,
  formBlock: FormBlock,
  mediaBlock: MediaBlock,
  gallery: GalleryBlock,
  faqs: FaqBlock,
  htmlEmbed: HtmlEmbedBlock,
  richText: ({
    content,
  }: {
    content: Page["layout"][0] extends infer T
      ? T extends { content?: infer C }
        ? C
        : never
      : never;
  }) => (
    <div className="container">
      <RichText data={content} />
    </div>
  ),
};

export default function RenderBlocks({
  blocks,
}: {
  blocks: Page["layout"][0][];
}) {
  if (!blocks?.length) return null;
  return blocks.map((block, index) => {
    const { blockType } = block;

    if (!blockType || !(blockType in blockComponents)) return null;

    const Block = blockComponents[blockType];
    return (
      <div className="my-4" key={index}>
        {/* @ts-expect-error dynamic block props union */}
        <Block {...block} />
      </div>
    );
  });
}
