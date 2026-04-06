import { draftMode } from "next/headers";

import type { Media, SiteSetting } from "@/lib/core/types/payload-types";

import { Logo, WhatsAppButton } from "@/components/shared/elements-ssr";
import {
  AdminBar,
  MobileMenu,
  ThemeSelector,
} from "@/components/shared/wrappers";
import CMSLink from "@/components/ui/cms-link";

export const AppActions = ({
  general,
}: {
  general: NonNullable<SiteSetting["general"]>;
}) => {
  return (
    <>
      <ThemeSelector />
      <WhatsAppButton {...general} />
      <Logo resource={general.logo as Media} />
    </>
  );
};

export default async function Header({
  header,
  general,
}: {
  header: NonNullable<SiteSetting["header"]>;
  general: NonNullable<SiteSetting["general"]>;
}) {
  const { isEnabled } = await draftMode();

  return (
    <header className="container relative z-20">
      <AdminBar adminBarProps={{ preview: isEnabled }} />

      <div className="flex items-center justify-between  py-2">
        <>
          <nav className="hidden items-center gap-3 lg:flex">
            {(header.navItems ?? []).map(({ link }, i) => (
              <CMSLink key={i} {...link} appearance="link" />
            ))}
          </nav>

          <div className="mt-1 lg:hidden">
            <MobileMenu navItems={header.navItems ?? []} />
          </div>
        </>

        <div className="flex shrink-0 items-center gap-3 md:gap-4">
          <AppActions general={general} />
        </div>
      </div>
    </header>
  );
}
