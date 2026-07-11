import OpenAI, { toFile } from "openai";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const openai = new OpenAI();
    const { imageBase64, mimeType, style, colorName, colorHex, windows, glass, hardware } =
      await request.json();

    const windowDesc =
      windows === "none"
        ? "no windows"
        : windows === "top-row-rect"
        ? "a single row of rectangular windows along the top section"
        : windows === "top-row-arch"
        ? "a single row of arched-top windows along the top section"
        : windows === "double-row"
        ? "two rows of rectangular windows"
        : windows === "full-view"
        ? "full-view glass panels throughout the entire door"
        : windows === "decorative"
        ? "decorative wrought-iron insert windows"
        : "no windows";

    const glassDesc =
      glass === "clear"
        ? "clear"
        : glass === "frosted"
        ? "frosted/obscure"
        : glass === "bronze"
        ? "bronze-tinted"
        : glass === "grey"
        ? "grey-tinted"
        : glass === "rain"
        ? "rain-texture obscure"
        : "clear";

    const hardwareDesc =
      hardware === "decorative"
        ? " with black decorative strap hinges and door handles to give a carriage-house appearance"
        : hardware === "none"
        ? " with no visible hardware"
        : "";

    const styleLabel =
      style === "raised-panel"
        ? "traditional raised-panel steel"
        : style === "carriage"
        ? "carriage-house"
        : style === "flush"
        ? "contemporary flush steel"
        : style === "full-view"
        ? "modern full-view aluminum-framed glass"
        : style === "ranch"
        ? "ranch-panel (horizontal groove)"
        : style === "short-panel"
        ? "short raised-panel"
        : "raised-panel";

    const prompt =
      `Replace the garage door(s) in this image with a ${styleLabel} garage door. ` +
      `The door colour is ${colorName} (${colorHex}). ` +
      `The door has ${windowDesc}` +
      (windows !== "none" ? ` with ${glassDesc} glass` : "") +
      `${hardwareDesc}. ` +
      `Keep every other element of the image completely unchanged — the house facade, brickwork, siding, ` +
      `roof, driveway, landscaping, trees, sky, vehicles, and all surroundings must remain identical. ` +
      `The new garage door must look completely photorealistic: properly fitted in the garage opening, ` +
      `with correct perspective, shadows, reflections, and lighting that matches the existing scene. ` +
      `Do not alter the size or position of the garage opening.`;

    const buffer = Buffer.from(imageBase64, "base64");
    const imageFile = await toFile(buffer, "garage.jpg", { type: mimeType });

    const response = await openai.images.edit({
      model: "gpt-image-1",
      image: imageFile,
      prompt,
      size: "1024x1024",
      quality: "medium",
    });

    const b64 = response.data?.[0]?.b64_json;
    if (!b64) throw new Error("No image data returned from OpenAI");
    return Response.json({ imageBase64: b64 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Visualize error:", msg);
    const friendly = msg.includes("429")
      ? "OpenAI quota exceeded — add billing credit at platform.openai.com/settings/organization/billing"
      : msg.includes("401") || msg.includes("API key")
      ? "Invalid API key — check OPENAI_API_KEY in .env.local"
      : msg;
    return Response.json({ error: friendly }, { status: 500 });
  }
}
