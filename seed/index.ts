import { basename, join, resolve } from "node:path";
import { readFile, rm } from "node:fs/promises";
import { getPayload, type CollectionSlug, type Payload } from "payload";
import appConfig from "@/lib/core/config";

import { hydrateSeedRichText } from "./helpers";

export default class SeedService {
  private payload!: Payload;

  private mockData: {
    siteSettings: {};
    blog: any[];
    pages: any[];
    forms: any[];
  } = {
    siteSettings: {},
    blog: [],
    pages: [],
    forms: [],
  };

  private ids: {
    mediaIds: number[];
    seoMediaIds: number[];
    galleryMediaIds: number[];
  } = {
    mediaIds: [],
    seoMediaIds: [],
    galleryMediaIds: [],
  };
  constructor(private mode: "seed" | "reset" = "reset") {}

  async init() {
    const { default: config } = await import("@payload-config");

    this.payload = await getPayload({ config });
    this.mockData = JSON.parse(
      await readFile(
        join(
          process.cwd(),
          "seed",
          "data",
          `mock-data-${appConfig.LOCAL.lang}.json`,
        ),
        "utf8",
      ),
    );
  }

  private async resetDb() {
    if (this.mode === "reset") {
      const collections: CollectionSlug[] = [
        "form-submissions",
        "forms",
        "blog-comments",
        "pages",
        "blog",
        "redirects",
        "users",
      ];
      for (const collection of collections) {
        await this.payload.db.deleteMany({
          collection,
          where: {},
        });
      }

      for (const collection of collections) {
        if (!this.payload.collections[collection].config.versions) continue;

        await this.payload.db.deleteVersions({
          collection,
          where: {},
        });
      }

      return;
    }
  }
  async run() {
    await this.init();
    await this.resetDb();
    this.payload.logger.info("Seeding database...");
    await this.seedUser();
    const media = await this.seedMedia();
    const blog = await this.seedBlog(media);
    await this.updateRelatedArticles(blog);
    const contactForm = await this.seedContactForm();
    const pages = await this.seedPages({ ...media, contactForm });
    await this.seedSiteSettings({
      contactPageId: (pages.contactPage as any).id as number,
      metaImageDoc: media.metaImageDoc,
    });
    await this.clearExtraMedia();
    this.payload.logger.info("Seeded database successfully!");
  }

  private injectData(data: any, values: Record<string, number | undefined>) {
    let json = JSON.stringify(data);

    for (const [key, value] of Object.entries(values)) {
      json = json.replaceAll(
        `"__${key}__"`,
        value != null ? String(value) : "null",
      );
    }

    return hydrateSeedRichText(JSON.parse(json));
  }

  async uploadMediaFromDisk(
    filePath: string,
    alt = "Product image",
    collection: CollectionSlug = "media",
  ) {
    const absolutePath = resolve(
      process.cwd(),
      "seed",
      "data",
      basename(filePath),
    );
    const buf = await readFile(absolutePath);
    const filename = basename(filePath);

    const mimetype = filename.endsWith(".webp")
      ? "image/webp"
      : filename.endsWith(".png")
        ? "image/png"
        : "image/jpeg";

    const uniqueName = `${Math.random().toString(36).slice(2, 5)}-${filename}`;

    const created = await this.payload.create({
      collection,
      data: { alt },
      file: {
        data: buf,
        mimetype,
        name: uniqueName,
        size: buf.length,
      },
    });

    return created.id;
  }
  private async seedUser() {
    this.payload.logger.info("— Seeding demo author and user...");

    return this.payload.create({
      collection: "users",
      data: {
        name: "Demo Admin",
        email: "admin@admin.com",
        password: "admin",
      },
    });
  }

  private async seedMedia() {
    this.payload.logger.info("— Seeding media...");

    if (!appConfig.STORAGE_PROVIDER) {
      await Promise.all(
        ["media", "seo-media", "gallery-media"].map((dir) =>
          rm(resolve(process.cwd(), "public", dir), {
            recursive: true,
            force: true,
          }),
        ),
      );
    }

    const files = [
      "image-blog1.webp",
      "image-blog2.webp",
      "image-blog3.webp",
      "image-hero1.webp",
    ];

    // Same source photos, uploaded a second time into "seo-media" so each article/page
    // gets a meta image that matches its own hero instead of one generic stock photo.
    const [docs, seoDocs] = await Promise.all([
      Promise.all(files.map((name) => this.uploadMediaFromDisk(name))),
      Promise.all(
        files.map((name) =>
          this.uploadMediaFromDisk(name, "Meta image", "seo-media"),
        ),
      ),
    ]);
    this.ids.mediaIds.push(...docs);
    this.ids.seoMediaIds.push(...seoDocs);

    const metaImageDoc = await this.uploadMediaFromDisk(
      "meta-website.webp",
      "Meta image",
      "seo-media",
    );
    this.ids.seoMediaIds.push(metaImageDoc);

    const galleryDocs = await Promise.all(
      [
        "gallery-1.webp",
        "gallery-2.webp",
        "gallery-3.webp",
        "gallery-4.webp",
      ].map((name) =>
        this.uploadMediaFromDisk(name, "Gallery image", "gallery-media"),
      ),
    );
    this.ids.galleryMediaIds.push(...galleryDocs);

    return {
      image1Doc: docs[0],
      image2Doc: docs[1],
      image3Doc: docs[2],
      imageHomeDoc: docs[3],
      seoImage1Doc: seoDocs[0],
      seoImage2Doc: seoDocs[1],
      seoImage3Doc: seoDocs[2],
      seoImageHomeDoc: seoDocs[3],
      metaImageDoc,
      galleryDocs,
    };
  }
  private async seedBlog({
    image1Doc,
    image2Doc,
    image3Doc,
    seoImage1Doc,
    seoImage2Doc,
    seoImage3Doc,
  }: {
    image1Doc: number;
    image2Doc: number;
    image3Doc: number;
    seoImage1Doc: number;
    seoImage2Doc: number;
    seoImage3Doc: number;
  }) {
    this.payload.logger.info("— Seeding blog...");

    const imagePairs = [
      { heroImage: image1Doc, blockImage: image2Doc, metaImage: seoImage1Doc },
      { heroImage: image2Doc, blockImage: image3Doc, metaImage: seoImage2Doc },
      { heroImage: image3Doc, blockImage: image1Doc, metaImage: seoImage3Doc },
    ];

    const articles = [];

    for (const [index, article] of this.mockData.blog.entries()) {
      const { heroImage, blockImage, metaImage } = imagePairs[index];
      const { comments = [], ...articleData } = article;
      const createdArticle = await this.payload.create({
        collection: "blog",
        depth: 0,
        data: this.injectData(articleData, {
          HERO_IMAGE: heroImage,
          BLOCK_IMAGE: blockImage,
          META_IMAGE: metaImage,
        }),
      });

      await Promise.all(
        comments.map((comment: any) => {
          const daysAgo = Math.floor(Math.random() * 30);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);

          return this.payload.create({
            collection: "blog-comments",
            data: {
              ...comment,
              blog: createdArticle.id,
              createdAt,
            },
          });
        }),
      );

      articles.push(createdArticle);
    }

    return {
      article1Doc: articles[0],
      article2Doc: articles[1],
      article3Doc: articles[2],
    };
  }
  private async updateRelatedArticles({
    article1Doc,
    article2Doc,
    article3Doc,
  }: {
    article1Doc: any;
    article2Doc: any;
    article3Doc: any;
  }) {
    await this.payload.update({
      id: article1Doc.id,
      collection: "blog",
      data: {
        relatedArticles: [article2Doc.id, article3Doc.id],
      },
    });

    await this.payload.update({
      id: article2Doc.id,
      collection: "blog",
      data: {
        relatedArticles: [article1Doc.id, article3Doc.id],
      },
    });

    await this.payload.update({
      id: article3Doc.id,
      collection: "blog",
      data: {
        relatedArticles: [article1Doc.id, article2Doc.id],
      },
    });
  }

  private async seedContactForm() {
    this.payload.logger.info("— Seeding contact form...");

    return this.payload.create({
      collection: "forms",
      depth: 0,
      data: this.mockData.forms[0],
    });
  }

  private async seedPages({
    imageHomeDoc,
    seoImageHomeDoc,
    image1Doc,
    galleryDocs,
    contactForm,
  }: {
    imageHomeDoc: any;
    seoImageHomeDoc: number;
    image1Doc: number;
    galleryDocs: number[];
    contactForm: any;
  }) {
    this.payload.logger.info("— Seeding pages...");

    const [GALLERY_IMAGE_1, GALLERY_IMAGE_2, GALLERY_IMAGE_3, GALLERY_IMAGE_4] =
      galleryDocs;

    const pages = [];

    for (const page of this.mockData.pages) {
      const data = this.injectData(page, {
        FORM: contactForm.id,
        HERO_IMAGE: imageHomeDoc,
        META_IMAGE: seoImageHomeDoc,
        CONTENT_IMAGE: image1Doc,
        GALLERY_IMAGE_1,
        GALLERY_IMAGE_2,
        GALLERY_IMAGE_3,
        GALLERY_IMAGE_4,
      });

      const created = await this.payload.create({
        collection: "pages",
        depth: 0,
        data,
      });

      pages.push(created);
    }

    return {
      homePage: pages.find((p) => p.slug === "home"),
      contactPage: pages.find((p) => p.slug === "contact"),
    };
  }

  private async seedSiteSettings({
    contactPageId,
    metaImageDoc,
  }: {
    contactPageId: number;
    metaImageDoc: number;
  }) {
    this.payload.logger.info("— Seeding globals...");

    const logo = await this.uploadMediaFromDisk(
      "logo_payload.webp",
      "logo",
      "media",
    );
    this.ids.mediaIds.push(logo);

    const data = this.injectData(this.mockData.siteSettings, {
      logo,
      contactPageId,
      metaImage: metaImageDoc,
    });

    await this.payload.updateGlobal({
      slug: "site-settings",
      data,
    });
  }
  private async clearExtraMedia() {
    const clears: [CollectionSlug, number[]][] = [
      ["media", this.ids.mediaIds],
      ["seo-media", this.ids.seoMediaIds],
      ["gallery-media", this.ids.galleryMediaIds],
    ];

    await Promise.all(
      clears.map(([collection, ids]) =>
        this.payload.db.deleteMany({
          collection,
          where: {
            id: { not_in: ids },
          },
        }),
      ),
    );
  }
}
