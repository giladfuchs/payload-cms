import type { CollectionSlug, Payload } from "payload";
import { getPayload } from "payload";

import { basename, join, resolve } from "node:path";
import { readFile, rm } from "node:fs/promises";
import appConfig from "@/lib/core/config";

export default class SeedService {
  private payload!: Payload;

  private mockData: {
    siteSettings: {};
    posts: any[];
    pages: any[];
    forms: any[];
  } = {
    siteSettings: {},
    posts: [],
    pages: [],
    forms: [],
  };

  private ids: {
    mediaIds: number[];
  } = {
    mediaIds: [],
  };
  constructor(private mode: "seed" | "reset" = "reset") {}

  async init() {
    const { default: config } = await import("../src/payload.config");

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
        "post-comments",
        "pages",
        "posts",
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
    const media = await this.seedMedia();
    await this.seedUser();
    const posts = await this.seedPosts({ ...media });
    await this.updateRelatedPosts(posts);
    const contactForm = await this.seedContactForm();
    const pages = await this.seedPages({ ...media, contactForm });
    await this.seedSiteSettings((pages.contactPage as any).id as number);
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

    return JSON.parse(json);
  }

  async uploadMediaFromDisk(filePath: string, alt = "Product image") {
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
      collection: "media",
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

    if (!appConfig.R2_PUBLIC_URL) {
      await rm(resolve(process.cwd(), "public", "media"), {
        recursive: true,
        force: true,
      });
    }
    const files = [
      "image-post1.webp",
      "image-post2.webp",
      "image-post3.webp",
      "image-hero1.webp",
      "meta-website.webp",
      "gallery-1.webp",
      "gallery-2.webp",
      "gallery-3.webp",
      "gallery-4.webp",
    ];

    const docs = await Promise.all(
      files.map((name) => this.uploadMediaFromDisk(name)),
    );

    this.ids.mediaIds.push(...docs);

    return {
      image1Doc: docs[0],
      image2Doc: docs[1],
      image3Doc: docs[2],
      imageHomeDoc: docs[3],
    };
  }
  private async seedPosts({
    image1Doc,
    image2Doc,
    image3Doc,
  }: {
    image1Doc: number;
    image2Doc: number;
    image3Doc: number;
  }) {
    this.payload.logger.info("— Seeding posts...");

    const imagePairs = [
      { heroImage: image1Doc, blockImage: image2Doc },
      { heroImage: image2Doc, blockImage: image3Doc },
      { heroImage: image3Doc, blockImage: image1Doc },
    ];

    const posts = [];

    for (const [index, post] of this.mockData.posts.entries()) {
      const { heroImage, blockImage } = imagePairs[index];

      const { comments = [], ...postData } = post;

      const createdPost = await this.payload.create({
        collection: "posts",
        depth: 0,
        data: this.injectData(postData, {
          HERO_IMAGE: heroImage,
          BLOCK_IMAGE: blockImage,
        }),
      });

      await Promise.all(
        comments.map((comment: any) => {
          const daysAgo = Math.floor(Math.random() * 30);
          const createdAt = new Date();
          createdAt.setDate(createdAt.getDate() - daysAgo);

          return this.payload.create({
            collection: "post-comments",
            data: {
              ...comment,
              post: createdPost.id,
              createdAt,
            },
          });
        }),
      );

      posts.push(createdPost);
    }

    return {
      post1Doc: posts[0],
      post2Doc: posts[1],
      post3Doc: posts[2],
    };
  }
  private async updateRelatedPosts({
    post1Doc,
    post2Doc,
    post3Doc,
  }: {
    post1Doc: any;
    post2Doc: any;
    post3Doc: any;
  }) {
    await this.payload.update({
      id: post1Doc.id,
      collection: "posts",
      data: {
        relatedPosts: [post2Doc.id, post3Doc.id],
      },
    });

    await this.payload.update({
      id: post2Doc.id,
      collection: "posts",
      data: {
        relatedPosts: [post1Doc.id, post3Doc.id],
      },
    });

    await this.payload.update({
      id: post3Doc.id,
      collection: "posts",
      data: {
        relatedPosts: [post1Doc.id, post2Doc.id],
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
    contactForm,
  }: {
    imageHomeDoc: any;
    contactForm: any;
  }) {
    this.payload.logger.info("— Seeding pages...");

    const pages = [];

    for (const page of this.mockData.pages) {
      let data;

      const [
        META_IMAGE,
        GALLERY_IMAGE_1,
        GALLERY_IMAGE_2,
        GALLERY_IMAGE_3,
        GALLERY_IMAGE_4,
      ] = this.ids.mediaIds.slice(-5);

      if (page.slug === "home")
        data = this.injectData(page, {
          HERO_IMAGE: imageHomeDoc,
          META_IMAGE,
          GALLERY_IMAGE_1,
          GALLERY_IMAGE_2,
          GALLERY_IMAGE_3,
          GALLERY_IMAGE_4,
        });
      else if (page.slug === "contact")
        data = this.injectData(page, {
          FORM: contactForm.id,
          META_IMAGE,
        });
      else data = page;

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

  private async seedSiteSettings(contactPageId: number) {
    this.payload.logger.info("— Seeding globals...");

    const logo = await this.uploadMediaFromDisk(
      "seed/data/logo_payload.webp",
      "logo",
    );
    this.ids.mediaIds.push(logo);

    const data = this.injectData(this.mockData.siteSettings, {
      logo,
      contactPageId,
      metaImage:
        this.ids.mediaIds[Math.floor(Math.random() * this.ids.mediaIds.length)],
    });

    await this.payload.updateGlobal({
      slug: "site-settings",
      data,
    });
  }
  private async clearExtraMedia() {
    await this.payload.db.deleteMany({
      collection: "media",
      where: {
        id: {
          not_in: this.ids.mediaIds,
        },
      },
    });
  }
}
