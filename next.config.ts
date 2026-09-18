import { withPayload } from "@payloadcms/next/withPayload";
import createNextIntlPlugin from "next-intl/plugin";

import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

import appConfig from "@/lib/core/config";

const withNextIntl = createNextIntlPlugin("./src/lib/intl/request.ts");

const remotePatternsFromConfig = (): RemotePattern[] => {
  const patterns: RemotePattern[] = [];

  if (appConfig.SERVER_URL) {
    const serverUrl = new URL(appConfig.SERVER_URL);
    patterns.push({
      protocol: serverUrl.protocol.slice(0, -1) as "http" | "https",
      hostname: serverUrl.hostname,
      ...(serverUrl.port ? { port: serverUrl.port } : {}),
      pathname: "/api/media/file/**",
    });
  }

  if (appConfig.STORAGE_URL) {
    const storageUrl = new URL(appConfig.STORAGE_URL);
    patterns.push({
      protocol: storageUrl.protocol.slice(0, -1) as "http" | "https",
      hostname: storageUrl.hostname,
      ...(storageUrl.port ? { port: storageUrl.port } : {}),
      pathname: "/**",
    });
  }

  return patterns;
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    unoptimized: true,
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    formats: ["image/avif", "image/webp"],
    remotePatterns: remotePatternsFromConfig(),
  },
  allowedDevOrigins:
    process.env.NODE_ENV === "development"
      ? [new URL(appConfig.SERVER_URL).hostname]
      : undefined,

  experimental: {
    optimizePackageImports: [
      "react-icons",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-label",
      "@radix-ui/react-select",
    ],
  },

  headers: async () => [
    {
      source: "/:path*",
      headers: [
        { key: "X-DNS-Prefetch-Control", value: "on" },
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      ],
    },
  ],
};

export default withPayload(withNextIntl(nextConfig), {
  devBundleServerPackages: false,
});
