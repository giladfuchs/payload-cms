import type { FormBlockProps } from "@/lib/core/types/types";
import type { Media } from "@/payload-types";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { FormBlockWrapper } from "@/components/shared/wrappers";
import DAL from "@/lib/core/dal";

type MediaBlockNode = {
  type: "block";
  fields: {
    blockType: "mediaBlock";
    media: number | Media;
  };
};

const isMediaBlockNode = (node: unknown): node is MediaBlockNode => {
  if (!node || typeof node !== "object") return false;

  const current = node as Partial<MediaBlockNode>;

  return (
    current.type === "block" &&
    current.fields?.blockType === "mediaBlock" &&
    typeof current.fields.media === "number"
  );
};

const hydrateRichTextMedia = async (
  richText?: DefaultTypedEditorState,
): Promise<DefaultTypedEditorState | undefined> => {
  if (!richText?.root?.children) return richText;

  const cloned = structuredClone(richText);
  const children = cloned.root.children as unknown[];

  const mediaIds = children
    .filter(isMediaBlockNode)
    .map((node) => node.fields.media)
    .filter((media): media is number => typeof media === "number");

  if (!mediaIds.length) return cloned;

  const media = await DAL.queryMediaByIds(mediaIds);
  const mediaById = new Map(media.map((item) => [item.id, item]));

  children.forEach((node) => {
    if (isMediaBlockNode(node) && typeof node.fields.media === "number") {
      node.fields.media = mediaById.get(node.fields.media) ?? node.fields.media;
    }
  });

  return cloned;
};

export default async function FormBlock(props: FormBlockProps) {
  const form = {
    ...props.form,
    confirmationMessage: await hydrateRichTextMedia(
      props.form.confirmationMessage,
    ),
  };

  return (
    <FormBlockWrapper
      {...props}
      form={form}
      introContent={await hydrateRichTextMedia(props.introContent)}
    />
  );
}
