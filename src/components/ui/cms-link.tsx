import Link from "next/link";

import type { Blog, Page } from "@/payload-types";
import type { ReactNode } from "react";

import { buttonVariants, type ButtonProps } from "@/components/ui/button";

type CMSLinkType = {
  appearance?: "inline" | ButtonProps["variant"] | null;
  children?: ReactNode;
  className?: string;
  label?: string | null;
  newTab?: boolean | null;
  reference?: {
    relationTo: "pages" | "blog";
    value: Blog | Page | string | number;
  } | null;
  size?: ButtonProps["size"] | null;
  type?: "custom" | "reference" | null;
  url?: string | null;
};

export default function CMSLink({
  type,
  appearance: appearanceFromProps,
  children,
  className,
  label,
  newTab,
  reference,
  size: sizeFromProps,
  url,
}: CMSLinkType) {
  const appearance = appearanceFromProps ?? "inline";

  const href =
    type === "reference" &&
    typeof reference?.value === "object" &&
    reference.value.slug
      ? `${reference.relationTo !== "pages" ? `/${reference.relationTo}` : ""}/${reference.value.slug}`
      : url;

  if (!href) return null;

  const size: ButtonProps["size"] =
    appearance === "link" ? "clear" : (sizeFromProps ?? undefined);

  const newTabProps = newTab
    ? { rel: "noopener noreferrer", target: "_blank" }
    : {};

  if (appearance === "inline") {
    return (
      <Link className={className} href={href} {...newTabProps}>
        {label}
        {children}
      </Link>
    );
  }

  return (
    <Link
      className={buttonVariants({ className, size, variant: appearance })}
      href={href}
      {...newTabProps}
    >
      {label}
      {children}
    </Link>
  );
}
