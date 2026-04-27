import type { MetaInput } from "@/lib/core/types/types";
import type { Metadata } from "next";

import appConfig from "@/lib/core/config";
import { resolveMediaUrl } from "@/lib/core/utilities";

export const generateMetadataLayout = (): Metadata => {
  return {
    metadataBase: new URL(appConfig.BASE_URL),
    openGraph: { siteName: appConfig.SITE_NAME },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },

    verification: {
      google: appConfig.GOOGLE_SITE_VERIFICATION,
    },

    icons: {
      icon: [
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
      other: {
        rel: "manifest",
        url: "/site.webmanifest",
      },
    },
  };
};

export const buildMetadata = ({
  title,
  description,
  image,
  path,
  modifiedTime,
}: MetaInput): Metadata => {
  if (!title) {
    return {
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const url = `${appConfig.BASE_URL}/${path}`;
  const imageUrl = resolveMediaUrl(image);

  return {
    title,
    description,
    twitter: {
      title,
      description,
      images: [imageUrl],
      card: "summary_large_image",
    },
    openGraph: {
      title,
      description,
      url,
      ...(modifiedTime && {
        type: "article",
        modifiedTime,
      }),
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
        },
      ],
    },

    alternates: {
      canonical: url,
    },
  };
};
