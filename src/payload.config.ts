import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { nodemailerAdapter } from "@payloadcms/email-nodemailer";
import { buildConfig } from "payload";
import { en } from "payload/i18n/en";
import { he } from "payload/i18n/he";
import sharp from "sharp";

import {
  Media,
  SeoMedia,
  GalleryMedia,
  Pages,
  Blog,
  Users,
  SiteSettings,
  BlogComments,
} from "@/lib/collections";
import { defaultLexical } from "@/lib/collections/fields/base-fields";
import appConfig from "@/lib/core/config";
import { plugins } from "@/lib/providers/plugins";

export default buildConfig({
  admin: {
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: "Mobile",
          name: "mobile",
          width: 375,
          height: 667,
        },
        {
          label: "Tablet",
          name: "tablet",
          width: 768,
          height: 1024,
        },
        {
          label: "Desktop",
          name: "desktop",
          width: 1440,
          height: 900,
        },
      ],
    },
  },

  editor: defaultLexical,

  i18n: {
    fallbackLanguage: appConfig.LOCAL.lang,
    supportedLanguages: appConfig.LOCAL.lang === "he" ? { he } : { en },
  },

  sharp,

  db: postgresAdapter({
    pool: {
      connectionString: appConfig.DATABASE_URL,
    },
  }),

  collections: [
    Pages,
    Blog,
    Media,
    SeoMedia,
    GalleryMedia,
    Users,
    BlogComments,
  ],

  cors: [appConfig.BASE_URL],

  globals: [SiteSettings],

  email: appConfig.EMAIL_SMTP_HOST
    ? nodemailerAdapter({
        defaultFromAddress: appConfig.EMAIL_FROM_ADDRESS,
        defaultFromName: appConfig.EMAIL_FROM_NAME,
        transportOptions: {
          host: appConfig.EMAIL_SMTP_HOST,
          port: Number(appConfig.EMAIL_SMTP_PORT || 587),
          secure: false,
          auth: {
            user: appConfig.EMAIL_SMTP_USER,
            pass: appConfig.EMAIL_SMTP_PASS,
          },
        },
      })
    : undefined,

  plugins,

  secret: appConfig.PAYLOAD_SECRET,

  typescript: {
    outputFile: path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "lib/core/types/payload-types.ts",
    ),
  },
});
