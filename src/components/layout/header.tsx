import { draftMode } from "next/headers";

import type { Media, SiteSetting } from "@/payload-types";

import RenderBlocks from "@/components/blocks/RenderBlocks";
import { Logo, WhatsAppButton } from "@/components/shared/elements-ssr";
import {
  HeaderClientWrapper,
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

export default async function Header({ settings }: { settings: SiteSetting }) {
  const { isEnabled } = await draftMode();
  const { general, header, popup } = settings;

  return (
    <>
      <div className="sticky top-0 z-50">
        <HeaderClientWrapper
          preview={isEnabled}
          navItems={header?.navItems ?? []}
          popup={popup}
          popupContent={
            popup?.content?.length ? (
              <RenderBlocks blocks={popup.content} />
            ) : null
          }
        />
        <header className="border-b border-border bg-background">
          <div className="container flex items-center justify-between py-2">
            <nav className="hidden items-center gap-3 lg:flex">
              {(header?.navItems ?? []).map(({ link }, index) => (
                <CMSLink key={index} {...link} appearance="link" />
              ))}
            </nav>

            <div aria-hidden className="w-5 lg:hidden" />

            <Logo resource={general.logo as Media} />

            <div className="flex shrink-0 items-center gap-3 md:gap-4">
              <ThemeSelector />
              <WhatsAppButton {...general} />
            </div>
          </div>
        </header>
      </div>
    </>
  );
}
