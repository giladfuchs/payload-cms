"use client";

import { useTranslations } from "next-intl";

import ButtonOriginal from "@/components/ui/button-original";

export default function Error({ reset }: { reset: () => void }) {
  const t = useTranslations("general");

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-black">
        <h2 className="text-2xl font-semibold">
          {t("somethingWentWrongTitle")}
        </h2>

        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          {t("somethingWentWrongDescription")}
        </p>

        <ButtonOriginal
          onClick={reset}
          variant="nav"
          className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t("tryAgain")}
        </ButtonOriginal>
      </div>
    </div>
  );
}
