"use client";

import dynamic from "next/dynamic";

export const ThemeSelector = dynamic(
  () =>
    import("@/components/shared/elements-client").then(
      (m) => m.ThemeSelectorClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-8 animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md" />
    ),
  },
);
export const MobileMenu = dynamic(
  () =>
    import("@/components/shared/elements-client").then(
      (m) => m.MobileMenuClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-10 w-full animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-md" />
    ),
  },
);

export const Popup = dynamic(() => import("@/components/layout/popup"), {
  ssr: false,
});
export const AccessibilityBar = dynamic(
  () => import("@/components/layout/accessibility-bar"),
  {
    ssr: false,
  },
);

export const FormBlock = dynamic(
  () => import("@/components/blocks/Form/Component"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full mx-auto max-w-lg animate-pulse space-y-5">
        <div className="h-4 w-1/2 bg-gray-300 rounded" />
        <div className="h-10 bg-gray-300 rounded" />
        <div className="h-10 bg-gray-300 rounded" />
        <div className="h-20 bg-gray-300 rounded" />
        <div className="h-10 w-32 bg-gray-300 rounded" />
      </div>
    ),
  },
);

export const AdminBarWrapper = dynamic(
  () =>
    import("@/components/shared/elements-client").then((m) => m.AdminBarClient),
  {
    ssr: false,
  },
);
