"use client";

import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useCallback, type ComponentType } from "react";
import { createPortal } from "react-dom";
import { FaBars, FaXmark } from "react-icons/fa6";
import { FiMoon, FiSun } from "react-icons/fi";
import {
  HiOutlineAdjustmentsHorizontal,
  HiOutlineArrowPath,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineMagnifyingGlassMinus,
  HiOutlineMagnifyingGlassPlus,
  HiOutlineUnderline,
} from "react-icons/hi2";

import type { SiteSetting } from "@/payload-types";
import type {
  PayloadAdminBarProps,
  PayloadMeUser,
} from "@payloadcms/admin-bar";

import Button from "@/components/ui/button";
import CMSLink from "@/components/ui/cms-link";
import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/utilities";
import { useTheme } from "@/lib/providers/theme";

export const AdminBarClient = ({
  adminBarProps = {},
}: {
  adminBarProps?: PayloadAdminBarProps;
}) => {
  const [show, setShow] = useState(false);
  const router = useRouter();

  const onAuthChange = useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id));
  }, []);

  return (
    <div
      dir="ltr"
      className={cn(
        "hidden w-full bg-black text-white md:px-18",
        show && "md:block",
      )}
    >
      {adminBarProps?.preview && (
        <RefreshRouteOnSave
          refresh={router.refresh}
          serverURL={appConfig.SERVER_URL}
        />
      )}
      <div className="container py-2">
        <PayloadAdminBar
          {...adminBarProps}
          className="py-2 text-white"
          classNames={{
            controls: "font-medium text-white",
            logo: "text-white",
            user: "text-white",
          }}
          cmsURL={appConfig.SERVER_URL}
          logo={<span>Dashboard</span>}
          onAuthChange={onAuthChange}
          onPreviewExit={() => {
            fetch(`${appConfig.SERVER_URL}/preview/exit`).then(() => {
              router.push("/");
              router.refresh();
            });
          }}
          style={{
            backgroundColor: "transparent",
            padding: 0,
            position: "relative",
            zIndex: "unset",
          }}
        />
      </div>
    </div>
  );
};

export const ThemeSelectorClient = () => {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("general");

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={t("toggle_theme")}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 bg-white shadow-sm transition hover:bg-neutral-100 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
    >
      {isDark ? (
        <FiSun className="size-5 text-yellow-400" />
      ) : (
        <FiMoon className="size-5 text-blue-400" />
      )}
    </Button>
  );
};

export const MobileMenuClient = ({
  navItems,
}: {
  navItems: NonNullable<NonNullable<SiteSetting["header"]>["navItems"]>;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>
        <FaBars className="size-5" />
      </button>

      {open &&
        createPortal(
          <div className="fixed inset-0 z-[100] bg-black/50">
            <div className="absolute top-0 start-0 flex h-full w-[10rem] flex-col gap-4 bg-background p-4 shadow-xl">
              <button onClick={() => setOpen(false)}>
                <FaXmark className="size-5" />
              </button>

              <nav className="flex flex-col gap-3">
                {navItems.map(({ link }, i) => (
                  <div key={i} onClick={() => setOpen(false)}>
                    <CMSLink
                      className="text-start"
                      {...link}
                      appearance="link"
                    />
                  </div>
                ))}
              </nav>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

type ButtonItem = {
  id: string;
  icon: ComponentType<{ className?: string }>;
  onClick: () => void;
  selected?: boolean;
};

export const createAccessibilityButtons = (
  increaseFont: () => void,
  decreaseFont: () => void,
  reset: () => void,
  grayscale: boolean,
  setGrayscale: (v: boolean) => void,
  highContrast: boolean,
  setHighContrast: (v: boolean) => void,
  invert: boolean,
  setInvert: (v: boolean) => void,
  underlineLinks: boolean,
  setUnderlineLinks: (v: boolean) => void,
  readableFont: boolean,
  setReadableFont: (v: boolean) => void,
): ButtonItem[] => [
  { id: "zoomIn", icon: HiOutlineMagnifyingGlassPlus, onClick: increaseFont },
  { id: "zoomOut", icon: HiOutlineMagnifyingGlassMinus, onClick: decreaseFont },
  {
    id: "grayscale",
    icon: HiOutlineAdjustmentsHorizontal,
    onClick: () => setGrayscale(!grayscale),
    selected: grayscale,
  },
  {
    id: "contrast",
    icon: HiOutlineAdjustmentsHorizontal,
    onClick: () => setHighContrast(!highContrast),
    selected: highContrast,
  },
  {
    id: "invert",
    icon: HiOutlineEye,
    onClick: () => setInvert(!invert),
    selected: invert,
  },
  {
    id: "underline",
    icon: HiOutlineUnderline,
    onClick: () => setUnderlineLinks(!underlineLinks),
    selected: underlineLinks,
  },
  {
    id: "readableFont",
    icon: HiOutlineDocumentText,
    onClick: () => setReadableFont(!readableFont),
    selected: readableFont,
  },
  { id: "reset", icon: HiOutlineArrowPath, onClick: reset },
];
