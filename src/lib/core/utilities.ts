import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import type { Media, RichTextBlock } from "@/lib/core/types/payload-types";

import appConfig from "@/lib/core/config";

export const resolveMediaUrl = (media: Media) => {
  const url = media.url!;
  return url.startsWith("http") || url.startsWith("/")
    ? url
    : `${appConfig.SERVER_URL}${url}`;
};

export const postJson = async <TResponse>(
  url: string,
  body: Record<string, unknown>,
): Promise<TResponse> => {
  const preparedBody: Record<string, unknown> = Object.fromEntries(
    Object.entries(body).map(([key, value]) => {
      if (typeof value === "string") {
        const trimmed = value.trim();
        return [key, trimmed === "" ? null : trimmed];
      }
      return [key, value];
    }),
  );

  const res = await fetch(`${appConfig.SERVER_URL}/api/${url}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(preparedBody),
  });

  const json: unknown = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "message" in json &&
      typeof (json as { message: unknown }).message === "string"
        ? (json as { message: string }).message
        : "Request failed";

    throw new Error(message);
  }

  return json as TResponse;
};
export const safeDecodeSlug = (value: string): string => {
  if (!value) return value;
  if (!value.includes("%")) return value;

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const getDecodedSlug = async (
  params: Promise<{ slug: string }>,
): Promise<string> => {
  const { slug } = await params;
  return safeDecodeSlug(slug ?? appConfig.HOME_SLUG);
};

export const getRevalidateTag = (input: string) => {
  const encoded = encodeURIComponent(input).replace(/,/g, "%2C");
  return encoded.length > 250 ? encoded.slice(0, 250) : encoded;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const extractRichTextText = (
  content: RichTextBlock["content"],
): string => {
  if (!content?.root?.children) return "";

  const collect = (
    nodes: RichTextBlock["content"]["root"]["children"],
  ): string => {
    let result = "";

    for (const node of nodes) {
      if (typeof node.text === "string") {
        result += node.text + " ";
      }

      if (Array.isArray(node.children)) {
        result += collect(node.children);
      }
    }

    return result;
  };

  return collect(content.root.children).trim();
};

const rtf = new Intl.RelativeTimeFormat(appConfig.LOCAL.locale, {
  numeric: "auto",
});

export const formatDate = {
  relativeTime: (iso: string) => {
    const diffMs = Date.now() - new Date(iso).getTime();
    const minutes = diffMs / 60000;
    const hours = diffMs / 3600000;
    const days = diffMs / 86400000;

    if (Math.abs(minutes) < 60)
      return rtf.format(-Math.round(minutes), "minute");

    if (Math.abs(hours) < 24) return rtf.format(-Math.round(hours), "hour");

    if (Math.abs(days) < 30) return rtf.format(-Math.round(days), "day");

    return new Date(iso).toLocaleDateString(appConfig.LOCAL.locale, {
      timeZone: appConfig.LOCAL.tz,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },

  dayMonthYear: (iso: string) =>
    new Date(iso).toLocaleDateString(appConfig.LOCAL.locale, {
      timeZone: appConfig.LOCAL.tz,
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
};
export const extractHtmlAssets = (
  html: string,
): {
  html: string;
  css: string;
  js: string;
} => {
  let css = "";
  let js = "";

  const cleanedHtml = html
    .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, (_, block) => {
      css += `${block.trim()}\n`;
      return "";
    })
    .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, (_, block) => {
      js += `${block.trim()}\n`;
      return "";
    })
    .trim();

  return {
    html: cleanedHtml,
    css: css.trim(),
    js: js.trim(),
  };
};

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

type AnyRecord = Record<string, unknown>;

export const deepMerge = <T extends AnyRecord, R extends AnyRecord>(
  target: T,
  source: R,
): T & R => {
  const output: AnyRecord = { ...target };

  if (!isObject(target) || !isObject(source)) {
    return output as T & R;
  }

  for (const key of Object.keys(source) as (keyof R)[]) {
    const sourceValue = source[key];
    const targetValue = target[key as keyof T];

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key as string] = deepMerge(
        targetValue as AnyRecord,
        sourceValue as AnyRecord,
      );
    } else {
      output[key as string] = sourceValue;
    }
  }

  return output as T & R;
};
