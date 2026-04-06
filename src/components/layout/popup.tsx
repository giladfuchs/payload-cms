"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IoClose } from "react-icons/io5";

import type { SiteSetting } from "@/payload-types";

import { AppConst } from "@/lib/core/types/types";

export default function PopupClient({
  popup,
  content,
}: {
  popup: NonNullable<SiteSetting["popup"]>;
  content: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (popup.delaySeconds < 1) return;

    const lastShown = localStorage.getItem(AppConst.POPUP_LAST_SHOWN_KEY);

    if (lastShown) {
      const daysSince =
        (Date.now() - new Date(lastShown).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince < popup.repeatDays) return;
    }

    const timeout = setTimeout(() => {
      setOpen(true);
      localStorage.setItem(
        AppConst.POPUP_LAST_SHOWN_KEY,
        new Date().toISOString(),
      );
    }, popup.delaySeconds * 1000);

    return () => clearTimeout(timeout);
  }, [popup.delaySeconds, popup.repeatDays]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[999]">
      <button
        className="absolute inset-0 bg-black/60"
        onClick={() => setOpen(false)}
        type="button"
      />

      <div className="absolute left-1/2 top-1/2 max-h-[85vh] w-[min(92vw,42rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <button
          className="absolute left-3 top-3 z-[100] cursor-pointer rounded-full border border-black/10 bg-white p-2 shadow-sm hover:bg-gray-100"
          onClick={() => setOpen(false)}
          type="button"
        >
          <IoClose className="size-6" />
        </button>

        <div className="-my-4">{content}</div>
      </div>
    </div>,
    document.body,
  );
}
