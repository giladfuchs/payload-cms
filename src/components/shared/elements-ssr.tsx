import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";

import type { Media } from "@/lib/core/types/payload-types";

import ImageVideo from "@/components/ui/image-video";
import DAL from "@/lib/core/dal";
import { CollectionName } from "@/lib/core/types/types";

export const WhatsAppButton = ({
  whatsappNumber,
  whatsappMessage,
}: {
  whatsappNumber?: string | null;
  whatsappMessage?: string | null;
}) => {
  if (!whatsappNumber) return null;

  const href = `https://wa.me/${whatsappNumber}${
    whatsappMessage ? `?text=${encodeURIComponent(whatsappMessage)}` : ""
  }`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white text-green-600 shadow-sm transition hover:bg-green-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:text-green-400 dark:hover:bg-neutral-800"
    >
      <FaWhatsapp className="size-5 text-green-600" />
    </a>
  );
};

export const Logo = ({ resource }: { resource: Media }) => {
  return (
    <Link href="/">
      <ImageVideo
        resource={resource}
        imgClassName="w-auto max-w-[9rem] object-contain h-8 invert dark:invert-0"
      />
    </Link>
  );
};

export const JsonLd = ({ data }: { data: unknown }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    }}
  />
);

const buildRedirectPath = (collection: string, slug?: string | null) => {
  if (!slug) return null;
  return `${collection !== CollectionName.pages ? `/${collection}` : ""}/${slug}`;
};

export const PayloadRedirects = async ({
  disableNotFound,
  url,
}: {
  disableNotFound?: boolean;
  url: string;
}) => {
  const redirectItem = await DAL.queryRedirectByFrom(url);

  if (redirectItem) {
    if (redirectItem.to?.url) {
      redirect(redirectItem.to.url);
    }

    const reference = redirectItem.to?.reference;

    if (
      reference?.relationTo &&
      typeof reference.value === "object" &&
      reference.value?.slug
    ) {
      const redirectUrl = buildRedirectPath(
        reference.relationTo,
        reference.value.slug,
      );
      if (redirectUrl) redirect(redirectUrl);
    }
  }

  if (disableNotFound) return null;

  notFound();
};
