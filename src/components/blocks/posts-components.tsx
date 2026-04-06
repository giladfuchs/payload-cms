import clsx from "clsx";
import { getTranslations } from "next-intl/server";
import React from "react";

import type { Post, PostComment } from "@/payload-types";
import type { Form } from "@payloadcms/plugin-form-builder/types";
import type { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";

import { FormBlock } from "@/components/shared/wrappers";
import Card from "@/components/ui/card";
import RichText from "@/components/ui/rich-text";
import { CollectionName } from "@/lib/core/types/types";
import { formatDate } from "@/lib/core/utilities";

const commentForm: Form = {
  id: 0,
  title: "post_comment",
  emails: [],
  fields: [
    {
      name: "authorName",
      label: "",
      width: 100,
      required: true,
      blockName: "authorName",
      blockType: "text",
    },
    {
      name: "authorEmail",
      label: "",
      width: 100,
      required: false,
      blockName: "authorEmail",
      blockType: "email",
    },
    {
      name: "body",
      label: "",
      width: 100,
      required: true,
      blockName: "body",
      blockType: "textarea",
    },
  ],
  submitButtonLabel: "",
  confirmationType: "message",
  confirmationMessage: {
    root: {
      type: "root",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: [
        {
          type: "heading",
          tag: "h2",
          version: 1,
          direction: null,
          format: "",
          indent: 0,
          children: [
            {
              type: "text",
              version: 1,
              text: "",
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
            },
          ],
        },
      ],
    },
  },
} as unknown as Form;
export const PostComments = async ({
  comments,
  postId,
}: {
  comments: PostComment[];
  postId: number;
}) => {
  const t = await getTranslations("post");
  const labelMap = {
    authorName: t("name"),
    authorEmail: t("email"),
    body: t("comment"),
  };

  commentForm.fields = commentForm.fields.map((f) =>
    "name" in f && "label" in f
      ? {
          ...f,
          label: labelMap[f.name as keyof typeof labelMap] ?? f.label,
        }
      : f,
  );

  commentForm.submitButtonLabel = t("send_comment");

  commentForm.confirmationMessage.root.children[0].children[0].text = t(
    "comment_submitted_successfully",
  );

  const introContent: DefaultTypedEditorState = {
    root: {
      type: "root",
      version: 1,
      direction: null,
      format: "",
      indent: 0,
      children: [
        {
          type: "heading",
          tag: "h3",
          version: 1,
          direction: null,
          format: "",
          indent: 0,
          children: [
            {
              type: "text",
              version: 1,
              text: t("add_comment"),
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
            },
          ],
        },
        {
          type: "paragraph",
          version: 1,
          direction: null,
          format: "",
          indent: 0,
          textFormat: 0,
          textStyle: "",
          children: [
            {
              type: "text",
              version: 1,
              text: t("add_comment_description"),
              detail: 0,
              format: 0,
              mode: "normal",
              style: "",
            },
          ],
        },
      ],
    },
  } as DefaultTypedEditorState;
  return (
    <section className="mt-16 flex justify-center px-4">
      <div className="w-full max-w-sm lg:max-w-3xl">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-semibold lg:text-2xl">
            {t("comments")} ({comments.length})
          </h2>
        </div>

        {!comments.length ? (
          <p className="text-muted-foreground">{t("no_comments_yet")}</p>
        ) : (
          <div className="space-y-10">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b pb-8 last:border-none">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-medium">{comment.authorName}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatDate.relativeTime(comment.createdAt)}
                  </span>
                </div>

                <p className="mt-3 break-words leading-relaxed text-foreground/80">
                  {comment.body}
                </p>
              </div>
            ))}
          </div>
        )}
        <div className="self-end sm:self-auto sm:shrink-0">
          <FormBlock
            form={commentForm}
            refreshOnSubmit
            enableIntro
            introContent={introContent}
            submitUrl="post-comments"
            submitData={{ post: postId }}
          />
        </div>
      </div>
    </section>
  );
};
export type RelatedPostsProps = {
  className?: string;
  docs?: Post[];
  introContent?: DefaultTypedEditorState;
};

export const RelatedPosts: React.FC<RelatedPostsProps> = (props) => {
  const { className, docs, introContent } = props;

  return (
    <div className={clsx("lg:container", className)}>
      {introContent && <RichText data={introContent} enableGutter={false} />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 items-stretch">
        {docs?.map((doc, index) => {
          if (typeof doc === "string") return null;

          return (
            <Card
              key={index}
              doc={{ relationTo: CollectionName.posts, value: doc }}
            />
          );
        })}
      </div>
    </div>
  );
};
