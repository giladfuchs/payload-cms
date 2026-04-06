import { DefaultTypedEditorState } from "@payloadcms/richtext-lexical";
import React from "react";

import { Width } from "../Width";

import RichText from "@/components/ui/rich-text";

export const Message: React.FC<{ message: DefaultTypedEditorState }> = ({
  message,
}) => {
  return (
    <Width className="my-12" width="100">
      {message && <RichText data={message} />}
    </Width>
  );
};
