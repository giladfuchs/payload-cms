"use client";

import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { createPortal } from "react-dom";
import { FaBars, FaXmark } from "react-icons/fa6";

import type { SiteSetting } from "@/payload-types";
import type {
  PayloadAdminBarProps,
  PayloadMeUser,
} from "@payloadcms/admin-bar";
import type { ReactNode } from "react";

import AccessibilityBar from "@/components/layout/accessibility-bar";
import Popup from "@/components/layout/popup";
import CMSLink from "@/components/ui/cms-link";
import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/utilities";

type NavItems = NonNullable<NonNullable<SiteSetting["header"]>["navItems"]>;

const AdminBar = ({
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

const MobileMenu = ({ navItems }: { navItems: NavItems }) => {
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

export default function HeaderClient({
  popup,
  popupContent,
  preview,
  navItems,
}: {
  popup?: SiteSetting["popup"];
  popupContent?: ReactNode;
  preview: boolean;
  navItems: NavItems;
}) {
  return (
    <>
      <AdminBar adminBarProps={{ preview }} />
      <div className="fixed start-4 top-4 z-[60] lg:hidden">
        <MobileMenu navItems={navItems} />
      </div>
      {popup?.content?.length && popupContent ? (
        <Popup popup={popup} content={popupContent} />
      ) : null}

      <AccessibilityBar />
    </>
  );
}
