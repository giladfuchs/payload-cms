import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

import type { CollectionSlug } from "payload";

import appConfig from "@/lib/core/config";
import DAL from "@/lib/core/dal";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);

  const path = searchParams.get("path");
  const collection = searchParams.get("collection") as CollectionSlug | null;
  const slug = searchParams.get("slug");
  const secret = searchParams.get("previewSecret");

  if (!appConfig.PREVIEW_SECRET || secret !== appConfig.PREVIEW_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  if (!path || !collection || !slug) {
    return new Response("Missing query params", { status: 400 });
  }

  if (!path.startsWith("/")) {
    return new Response("Path must be relative", { status: 400 });
  }

  const draft = await draftMode();

  try {
    const user = await DAL.queryCurrentUser(req);

    if (!user) {
      draft.disable();
      return new Response("Forbidden", { status: 403 });
    }
  } catch {
    draft.disable();
    return new Response("Forbidden", { status: 403 });
  }

  draft.enable();
  redirect(path);
}
