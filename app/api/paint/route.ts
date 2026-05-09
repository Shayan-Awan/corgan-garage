import OpenAI, { toFile } from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    const req = await request.json();
    const { imageBase64, mimeType, colorName, colorHex } = req;

    const buffer = Buffer.from(imageBase64, "base64");
    const imageFile = await toFile(buffer, "room.jpg", { type: mimeType });

    const quality = (["low", "medium"].includes(req.quality)
      ? req.quality
      : "medium") as "low" | "medium";

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt: `Repaint only the wall surfaces in this room to ${colorName} (${colorHex}). Keep all furniture, flooring, ceiling, trim, windows, lighting, and decorative items exactly as they are. The walls should look freshly painted with a smooth, even finish. Photorealistic result.`,
      size: "1024x1024",
      quality,
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data in response");
    return Response.json({ imageBase64: b64 });
  } catch (error) {
    console.error("Paint error:", error);
    return Response.json(
      { error: "Failed to generate visualization. Check your OPENAI_API_KEY." },
      { status: 500 }
    );
  }
}
