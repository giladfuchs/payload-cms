"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import { Children, useEffect, useMemo, useState, type ReactNode } from "react";
import { FiMoon, FiSun } from "react-icons/fi";

import Button from "@/components/ui/button";
import appConfig from "@/lib/core/config";
import { cn } from "@/lib/core/utilities";
import { useTheme } from "@/lib/providers/theme";

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  return prefersReducedMotion;
};

export const AutoScrollRowClient = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const itemCount = Children.count(children);
  const prefersReducedMotion = usePrefersReducedMotion();
  const autoScroll = useMemo(
    () =>
      AutoScroll({
        active: !prefersReducedMotion && itemCount >= 2,
        breakpoints: {
          "(min-width: 1024px)": {
            active: !prefersReducedMotion && itemCount >= 4,
          },
        },
        speed: 0.5,
        stopOnFocusIn: true,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    [itemCount, prefersReducedMotion],
  );
  const [emblaRef] = useEmblaCarousel(
    {
      align: "start",
      containScroll: false,
      direction: appConfig.LOCAL.dir,
      loop: true,
    },
    [autoScroll],
  );

  return (
    <div
      ref={emblaRef}
      aria-hidden="true"
      className={cn("overflow-hidden", className)}
    >
      <div className="flex gap-4">{children}</div>
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
