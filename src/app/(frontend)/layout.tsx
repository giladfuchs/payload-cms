import "@/lib/styles/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import RenderBlocks from "@/components/blocks/RenderBlocks";
import AdminBar from "@/components/layout/admin-bar";
import AnalyticsLayout from "@/components/layout/analytics";
import Footer from "@/components/layout/footer";
import Head from "@/components/layout/head";
import Header from "@/components/layout/header";
import { AccessibilityBar, Popup } from "@/components/shared/wrappers";
import appConfig from "@/lib/core/config";
import Dal from "@/lib/core/dal";
import { IntlProvider } from "@/lib/providers/intl";
import { generateMetadataLayout } from "@/lib/seo/metadata";

export const metadata: Metadata = generateMetadataLayout();
export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const siteSettings = await Dal.querySiteSettings();

  return (
    <html
      lang={appConfig.LOCAL.lang}
      dir={appConfig.LOCAL.dir}
      suppressHydrationWarning
    >
      <head>
        <Head />
      </head>

      <body>
        <div className="mx-auto w-full max-w-6xl">
          <AnalyticsLayout />

          <IntlProvider>
            <AdminBar />
            <Header
              header={siteSettings.header!}
              general={siteSettings.general}
            />
            {siteSettings.popup?.content?.length ? (
              <Popup
                popup={siteSettings.popup}
                content={<RenderBlocks blocks={siteSettings.popup.content} />}
              />
            ) : null}
            <AccessibilityBar />
            {children}
            <Footer
              footer={siteSettings.footer!}
              general={siteSettings.general}
            />
          </IntlProvider>
        </div>
      </body>
    </html>
  );
}
