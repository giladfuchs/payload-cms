"use client";

import { PayloadAdminBar } from "@payloadcms/admin-bar";
import { RefreshRouteOnSave } from "@payloadcms/live-preview-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

import type {
  PayloadAdminBarProps,
  PayloadMeUser,
} from "@payloadcms/admin-bar";

import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/utilities";

export default function AdminBarClient({
  adminBarProps = {},
}: {
  adminBarProps?: PayloadAdminBarProps;
}) {
  const [show, setShow] = useState(false);
  const router = useRouter();

  const onAuthChange = useCallback((user: PayloadMeUser) => {
    setShow(Boolean(user?.id));
  }, []);

  return (
    <div
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
            fetch("/preview/exit").then(() => {
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
}
