import { revalidateTag } from "next/cache";
import sharp from "sharp";

import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  CollectionBeforeChangeHook,
  PayloadRequest,
} from "payload";

import appConfig from "@/lib/core/config";
import { AppConst, CollectionName } from "@/lib/core/types/types";
import { getRevalidateTag } from "@/lib/core/utilities";

const revalidate = (tag: string) => {
  revalidateTag(getRevalidateTag(tag), "max");
};

export const makeRevalidateHooks = (
  collection: CollectionName,
): {
  afterChange: CollectionAfterChangeHook[];
  afterDelete: CollectionAfterDeleteHook[];
} => {
  return {
    afterChange: [
      async ({ doc, previousDoc }) => {
        const newSlug = doc?.slug ? String(doc.slug) : "";
        if (!newSlug) return doc;

        const prevSlug = previousDoc?.slug ? String(previousDoc.slug) : "";

        try {
          if (prevSlug && prevSlug !== newSlug) {
            revalidate(`${collection}-${prevSlug}`);
          }

          revalidate(`${collection}-${newSlug}`);
          revalidate(AppConst.CACHE_TAG_SITEMAP);
        } catch {}

        return doc;
      },
    ],
    afterDelete: [
      async ({ doc }) => {
        const slug = doc?.slug ? String(doc.slug) : "";
        if (!slug) return doc;

        revalidate(`${collection}-${slug}`);
        revalidate(AppConst.CACHE_TAG_SITEMAP);

        return doc;
      },
    ],
  };
};

const revalidateRedirect = (from: string) => {
  revalidate(`${CollectionName.redirects}-${from}`);
};

export const revalidateRedirects: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
}) => {
  revalidateRedirect(doc.from);

  if (previousDoc?.from && previousDoc.from !== doc.from) {
    revalidateRedirect(previousDoc.from);
  }

  return doc;
};

export const revalidateDeleteRedirects: CollectionAfterDeleteHook = ({
  doc,
}) => {
  revalidateRedirect(doc.from);
  return doc;
};

type UploadFile = {
  data?: object;
  mimetype?: string;
  type?: string;
  size?: number;
  filename?: string;
  originalname?: string;
  name?: string;
};

type CloudContext = {
  _payloadCloudStorage?: {
    file?: UploadFile;
  };
};

export const mediaTransformUploadHook: CollectionBeforeChangeHook = async ({
  req,
  operation,
  data,
}) => {
  if (operation !== "create" && operation !== "update") return;
  if (!appConfig.R2_PUBLIC_URL) return;

  const typedReq = req as PayloadRequest & {
    file?: UploadFile;
    context?: CloudContext;
  };

  const file = typedReq.file ?? typedReq.context?._payloadCloudStorage?.file;
  if (!file?.data) return;

  const mime = file.mimetype || file.type || "";
  if (!mime.startsWith("image/") || mime === "image/webp") return;

  const inputName = file.filename || file.originalname || file.name || "image";
  const safeBaseName = (
    inputName.split("?")[0].split("#")[0].split("/").pop() || "image"
  )
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  const webpName = `${safeBaseName}-${Math.random().toString(36).slice(2, 8)}.webp`;

  const out = await sharp(file.data)
    .rotate()
    .webp({
      quality: 85,
      effort: 6,
    })
    .toBuffer();

  const meta = await sharp(out).metadata();

  const patch = (target?: UploadFile) => {
    if (!target) return;
    target.data = out;
    target.mimetype = "image/webp";
    target.type = "image/webp";
    target.size = out.length;
    target.filename = webpName;
    target.originalname = webpName;
    target.name = webpName;
  };

  patch(typedReq.file);
  patch(typedReq.context?._payloadCloudStorage?.file);

  data.filename = webpName;
  data.mimeType = "image/webp";
  data.filesize = out.length;
  data.width = meta.width;
  data.height = meta.height;
};
