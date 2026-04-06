# Payload CMS Website Starter

Production-ready **CMS + website platform** built with **Payload CMS 3 + Next.js 16**.

**Includes a fully-featured admin panel, live preview, and modern frontend.**

Perfect for **websites, blogs, landing pages, and content platforms**.

## Features

- Flexible **Pages & Posts** powered by Layout Builder
- **Draft Preview** + **Live Preview** for real-time editing
- **SEO-ready** (metadata, JSON-LD, sitemap, robots.txt)
- Built-in **Redirects system** for safe URL changes
- Integrated **Analytics & Pixels** (GA4, GTag, Meta, TikTok) with conversion tracking
- **Media library** with automatic image optimization

## Live Preview

**Main Site:**
https://cms.url-link.org

**Admin Panel:**
https://cms.url-link.org/admin

**Demo Login:**
Email: `admin@admin.com`
Password: `admin`

🔄 Reset Demo Data

If demo data was modified while you or another user were testing, you can restore it to a fresh state by visiting:
https://cms.url-link.org/preview/reset

#### This will reset and reseed the database.

---

## ▲ Deploy Your Own

Deploy your own Payload-powered CMS.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/giladfuchs/payload-cms)

After creating your project, make sure to go to the Vercel dashboard
and update your environment variables based on [.env.example](.env.example)

---

## Core CMS Concepts

### Pages

Flexible layout-driven content to create landing pages and core site pages.

---

### Posts

Used for dynamic content like blogs, news, or articles.

Supports full layouts, rich content, and SEO aligned with article standards.

---

### Site Settings (Globals)

Central place to manage global content across your site.

Includes:

- **General**
  Basic site config like logo, branding, and WhatsApp icon

- **Popup**
  Control site popup behavior
  If `delaySeconds = 0` → popup is disabled

- **Header**
  Navigation menu (links shown in the header)

- **Footer**
  Footer links and social icons

All changes here apply across the entire website.

---

## Layout Builder

Create flexible pages using pre-built blocks:

- **Hero**
  Top section for strong first impression (title, text, image, actions)

- **Content**
  Structured text content with rich formatting

- **Media**
  Display images or videos with layout control

- **Call To Action (CTA)**
  Highlight actions like buttons, links, or promotions

- **Archive**
  Auto-list content (posts, items, etc.)

- **Gallery**
  Image gallery / grid display

- **FAQs**
  Collapsible Q&A section (improves SEO and AI discoverability)

- **Form**
  Collect user input (contact, leads, etc.)

- **Media Block**
  Advanced media section with custom layout + text

- **HTML Embed**
  Embed external content (iframe, scripts, widgets)

- **Rich Text**
  Flexible editor-based content (Lexical)

## Stack

- **Next.js 16** (App Router) + **React 19** + **Payload CMS 3** + **PostgreSQL**
- **Tailwind CSS 4** + **React Icons** + **next-intl** + **radix-ui** + **React Hook Form**
- **pnpm** as package manager (Node >= 22)

## Caching & Revalidation

- Uses Next.js tag-based caching
- Content updates trigger on-demand revalidation
- Draft mode supported (does not affect cache)

---

### Local Development

Clone the repo and start a local PostgreSQL with Docker:

```bash
docker run --name payload-cms-db \
  -e POSTGRES_USER=admin \
  -e POSTGRES_PASSWORD=admin \
  -e POSTGRES_DB=payload \
  -p 5446:5432 \
  -v payload-cms-data:/var/lib/postgresql/data \
  -d postgres:17
```

Create a `.env` file based on [`.env.example`](.env.example) and configure your environment variables, then install and run:

```bash
pnpm install
pnpm dev
```

To seed mock data for local development, run the [`seeder script`](seed/run.ts):

```bash
pnpm tsx  seed/run.ts
```

---

## 🤝 Contributing

Contributions are welcome!
If you find this project useful, consider giving it a ⭐ on GitHub — it helps others discover it!

To contribute, fork the repository and submit a pull request with your enhancements or bug fixes.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
