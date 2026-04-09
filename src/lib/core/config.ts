type AppLocale = "en" | "he";

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

  R2_BUCKET: string;
  R2_BUCKET_PREFIX: string;
  R2_ENDPOINT: string;
  R2_ACCESS_KEY_ID: string;
  R2_SECRET_ACCESS_KEY: string;
  R2_PUBLIC_URL: string;

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

  R2_BUCKET: process.env.R2_BUCKET as string,
  R2_BUCKET_PREFIX: process.env.R2_BUCKET_PREFIX ?? "payload_cms",
  R2_ENDPOINT: process.env.R2_ENDPOINT as string,
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID as string,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY as string,
  R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL as string,

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
