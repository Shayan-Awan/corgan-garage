import OpenAI from "openai";
import { NextRequest } from "next/server";

const openai = new OpenAI();

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, mimeType } = await request.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "You are an expert interior design colour consultant. Respond with valid JSON only — no markdown, no explanation.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mimeType};base64,${imageBase64}` },
            },
            {
              type: "text",
              text: `Analyse this room and suggest 5 wall paint colours. Return a JSON array:
[
  {
    "name": "Colour display name",
    "hex": "#RRGGBB",
    "brand": "Paint brand + code (e.g. Benjamin Moore HC-166)",
    "mood": "Brief mood (e.g. Calm and airy)",
    "reason": "One sentence why this suits this specific room"
  }
]
Consider existing furniture, flooring, lighting, and room size. Vary from safe neutrals to bolder options.`,
            },
          ],
        },
      ],
    });

    const text = response.choices[0].message.content ?? "";
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in response");

    const colors = JSON.parse(match[0]);
    return Response.json({ colors });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Analyze error:", msg);
    const friendly = msg.includes("429")
      ? "OpenAI quota exceeded — add billing credit at platform.openai.com/settings/organization/billing"
      : msg.includes("401") || msg.includes("API key")
      ? "Invalid API key — check OPENAI_API_KEY in .env.local"
      : msg;
    return Response.json({ error: friendly }, { status: 500 });
  }
}
