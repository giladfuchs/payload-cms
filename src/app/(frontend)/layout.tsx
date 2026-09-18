import "@/lib/styles/globals.css";

import type { Metadata } from "next";
import type { ReactNode } from "react";

import AnalyticsLayout from "@/components/layout/analytics";
import Footer from "@/components/layout/footer";
import Head from "@/components/layout/head";
import Header from "@/components/layout/header";
import { JsonLd } from "@/components/shared/elements-ssr";
import appConfig from "@/lib/core/config";
import Dal from "@/lib/core/dal";
import { IntlProvider } from "@/lib/providers/intl";
import { createJsonLdSite } from "@/lib/seo/jsonld";
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
        <JsonLd data={createJsonLdSite(siteSettings)} />
      </head>

      <body>
        <div className="mx-auto w-full max-w-6xl">
          <AnalyticsLayout />

          <IntlProvider>
            <Header settings={siteSettings} />
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
