import {
  FaInstagram,
  FaFacebookF,
  FaTiktok,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { HiOutlinePhone, HiOutlineMail } from "react-icons/hi";
import { TbWorld } from "react-icons/tb";

import type { SiteSetting } from "@/lib/core/types/payload-types";

import ContentBlock from "@/components/blocks/Content/Component";
import { AppActions } from "@/components/layout/header";
import CMSLink from "@/components/ui/cms-link";

const SOCIALS = {
  instagram: {
    icon: <FaInstagram className="h-7 w-7 text-pink-600" />,
    base: "https://instagram.com/",
  },
  facebook: {
    icon: <FaFacebookF className="h-7 w-7 text-blue-600" />,
    base: "https://facebook.com/",
  },
  tiktok: {
    icon: <FaTiktok className="h-7 w-7" />,
    base: "https://tiktok.com/@",
  },
  linkedin: {
    icon: <FaLinkedinIn className="h-7 w-7 text-blue-700" />,
    base: "https://linkedin.com/in/",
  },
  youtube: {
    icon: <FaYoutube className="h-7 w-7 text-red-600" />,
    base: "https://youtube.com/",
  },

  x: {
    icon: <FaXTwitter className="h-7 w-7" />,
    base: "https://x.com/",
  },
  website: {
    icon: <TbWorld className="h-7 w-7 text-blue-600" />,
    base: "",
  },
  phone: {
    icon: <HiOutlinePhone className="h-7 w-7 text-green-600" />,
    base: "tel:",
  },
  email: {
    icon: <HiOutlineMail className="h-7 w-7 text-red-600" />,
    base: "mailto:",
  },
} as const;

export default function Footer({
  footer,
  general,
}: {
  footer: SiteSetting["footer"];
  general: SiteSetting["general"];
}) {
  return (
    <footer className="mt-auto border-t border-border py-4">
      {footer?.content?.length ? (
        <ContentBlock columns={footer.content} blockType="content" />
      ) : null}
      <div className="container flex flex-col gap-4  md:flex-row md:items-center">
        <div className="flex items-center gap-4 flex-row-reverse">
          <AppActions general={general} />
        </div>

        <nav className="flex flex-wrap items-center gap-4 md:ml-8">
          {(footer?.navItems ?? []).map(({ link }, i) => (
            <CMSLink key={i} {...link} appearance="link" />
          ))}
        </nav>

        <div className="flex flex-wrap items-center gap-4 md:ml-auto">
          {(
            Object.entries(SOCIALS) as [
              keyof typeof SOCIALS,
              (typeof SOCIALS)[keyof typeof SOCIALS],
            ][]
          ).map(([key, item]) => {
            const value = footer?.[key];
            if (typeof value !== "string" || !value) return null;

            const href = item.base ? `${item.base}${value}` : value;

            return (
              <a
                key={key}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel={
                  href.startsWith("http") ? "noopener noreferrer" : undefined
                }
                className="flex items-center justify-center rounded-full transition hover:bg-muted"
              >
                {item.icon}
              </a>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
