import { NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// curl -X GET http://localhost:3060/preview/reset
export async function GET(request: Request) {
  try {
    void request.url;
    const { default: SeedService } = await import("seed");

    await new SeedService("reset").run();

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
