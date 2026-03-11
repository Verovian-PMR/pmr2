import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation endpoint.
 *
 * Called by the dashboard after saving settings/pages so that the
 * public-site immediately reflects the latest data without waiting
 * for the time-based revalidation window.
 *
 * Usage:
 *   POST /api/revalidate
 *   Body: { "tags": ["settings", "pages"] }
 *
 * If no tags are provided, all known cache tags are revalidated.
 */

const ALL_TAGS = ["settings", "pages", "services"] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tags: string[] =
      Array.isArray(body.tags) && body.tags.length > 0
        ? body.tags
        : [...ALL_TAGS];

    for (const tag of tags) {
      revalidateTag(tag);
    }

    return NextResponse.json({ revalidated: true, tags });
  } catch {
    return NextResponse.json(
      { revalidated: false, error: "Revalidation failed" },
      { status: 500 },
    );
  }
}
