export const dynamic = "force-dynamic";

import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/svg+xml",
            "video/mp4",
            "video/quicktime",
            "video/webm",
            "audio/mpeg",
            "audio/mp3",
            "audio/wav",
            "audio/ogg",
            "audio/m4a"
          ],
          maximumSizeInBytes: 500 * 1024 * 1024, // 500 MB limit
          tokenPayload: JSON.stringify({}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Direct upload finished successfully
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
