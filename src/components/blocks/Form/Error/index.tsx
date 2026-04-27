"use client";

import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext();

  const t = useTranslations("blocks.form");

  return (
    <div className="mt-2 text-red-500 text-sm">
      {(errors[name]?.message as string) || t("required")}
    </div>
  );
};
