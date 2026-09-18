type AppLocale = "en" | "he";

type StorageProvider = "vercel" | "s3";

type LocaleConfig = {
  lang: AppLocale;
  dir: "ltr" | "rtl";
  locale: "en-US" | "he-IL";
  tz: string;
  isRtl: boolean;
};

const LOCALE_CONFIG: Record<AppLocale, LocaleConfig> = {
  en: {
    lang: "en",
    dir: "ltr",
    locale: "en-US",
    tz: "UTC",
    isRtl: false,
  },
  he: {
    lang: "he",
    dir: "rtl",
    locale: "he-IL",
    tz: "Asia/Jerusalem",
    isRtl: true,
  },
};

export type AppConfig = {
  SITE_NAME: string;
  HOME_SLUG: string;
  BASE_URL: string;
  SERVER_URL: string;
  LOCAL: LocaleConfig;
  DATABASE_URL: string;
  PREVIEW_SECRET: string;
  PAYLOAD_SECRET: string;

  STORAGE_PROVIDER?: StorageProvider;
  STORAGE_URL?: string;
  BUCKET_PREFIX: string;

  BLOB_READ_WRITE_TOKEN?: string;

  S3_BUCKET: string;
  S3_ENDPOINT: string;
  S3_ACCESS_KEY_ID: string;
  S3_SECRET_ACCESS_KEY: string;

  EMAIL_FROM_ADDRESS: string;
  EMAIL_FROM_NAME: string;
  EMAIL_SMTP_HOST: string;
  EMAIL_SMTP_PORT: number;
  EMAIL_SMTP_USER: string;
  EMAIL_SMTP_PASS: string;

  GOOGLE_SITE_VERIFICATION?: string;
  GOOGLE_ANALYTICS?: string;
  GOOGLE_ADS?: string;
  TIKTOK_PIXEL?: string;
  META_PIXEL?: string;
};

export const appConfig: AppConfig = {
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME as string,
  HOME_SLUG: process.env.NEXT_PUBLIC_HOME_SLUG ?? "home",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL as string,
  SERVER_URL: (process.env.NEXT_PUBLIC_SERVER_URL ??
    process.env.NEXT_PUBLIC_BASE_URL) as string,
  LOCAL: LOCALE_CONFIG[
    (process.env.NEXT_PUBLIC_LANG as AppLocale) ?? "en"
  ] as LocaleConfig,
  DATABASE_URL: process.env.DATABASE_URL as string,

  PREVIEW_SECRET: process.env.PREVIEW_SECRET as string,
  PAYLOAD_SECRET: process.env.PAYLOAD_SECRET as string,

  STORAGE_PROVIDER: process.env.STORAGE_PROVIDER as StorageProvider,

  STORAGE_URL: process.env.NEXT_PUBLIC_STORAGE_URL?.replace(/\/+$/, ""),
  BUCKET_PREFIX: process.env.BUCKET_PREFIX ?? "payload_cms",

  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN as string,

  S3_BUCKET: process.env.S3_BUCKET as string,
  S3_ENDPOINT: process.env.S3_ENDPOINT as string,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID as string,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY as string,

  EMAIL_FROM_ADDRESS: process.env.EMAIL_FROM_ADDRESS as string,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME as string,
  EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST as string,
  EMAIL_SMTP_PORT: Number(process.env.EMAIL_SMTP_PORT || 587),
  EMAIL_SMTP_USER: process.env.EMAIL_SMTP_USER as string,
  EMAIL_SMTP_PASS: process.env.EMAIL_SMTP_PASS as string,

  GOOGLE_SITE_VERIFICATION: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  GOOGLE_ANALYTICS: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS,
  GOOGLE_ADS: process.env.NEXT_PUBLIC_GOOGLE_ADS,
  TIKTOK_PIXEL: process.env.NEXT_PUBLIC_TIKTOK_PIXEL,
  META_PIXEL: process.env.NEXT_PUBLIC_META_PIXEL,
};

export default appConfig;
