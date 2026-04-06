import { NextResponse } from "next/server";

import { getPayload } from "@/lib/core/queries";

export const maxDuration = 60;

// curl -X GET http://localhost:3060/preview/reset
export async function GET(request: Request) {
  try {
    void request.url;
    const payload = await getPayload();
    const { default: SeedService } = await import("seed");

    const seed = new SeedService(payload, "seed");
    await seed.run();

    return NextResponse.json({
      success: true,
      message: "Database reset and seed triggered successfully",
    });
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error
        ? err.message.slice(0, 200)
        : String(err).slice(0, 200);

    return NextResponse.json(
      {
        success: false,
        message: "Seed failed",
        error: errorMessage,
      },
      { status: 500 },
    );
  }
}
