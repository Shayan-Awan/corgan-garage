import OpenAI, { toFile } from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType, colorName, colorHex } = await request.json();

    const buffer = Buffer.from(imageBase64, "base64");
    const imageFile = await toFile(buffer, "room.jpg", { type: mimeType });

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt: `Repaint only the wall surfaces in this room to ${colorName} (${colorHex}). Keep all furniture, flooring, ceiling, trim, windows, lighting, and decorative items exactly as they are. The walls should look freshly painted with a smooth, even finish. Photorealistic result.`,
      size: "1024x1024",
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data in response");
    return Response.json({ imageBase64: b64 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Paint error:", msg);
    const friendly = msg.includes("429")
      ? "OpenAI quota exceeded — add billing credit at platform.openai.com/settings/organization/billing"
      : msg.includes("401") || msg.includes("API key")
      ? "Invalid API key — check OPENAI_API_KEY in .env.local"
      : msg;
    return Response.json({ error: friendly }, { status: 500 });
  }
}
