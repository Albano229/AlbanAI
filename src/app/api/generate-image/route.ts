import { NextResponse } from "next/server";

const REPLICATE_API_KEY = process.env.REPLICATE_API_KEY;
const FLUX_MODEL = "black-forest-labs/flux-schnell";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt) return NextResponse.json({ error: "Prompt requis" }, { status: 400 });

    // Lancer la génération d'image
    const createRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "black-forest-labs/flux-schnell",
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: "16:9",
          output_format: "webp",
          quality: 90,
        },
      }),
    });

    const prediction = await createRes.json();
    if (!prediction.id) {
      return NextResponse.json({ error: "Erreur Replicate", detail: prediction }, { status: 500 });
    }

    // Attendre le résultat (max 30s)
    let result = prediction;
    const start = Date.now();
    while (result.status !== "succeeded" && result.status !== "failed") {
      if (Date.now() - start > 30000) {
        return NextResponse.json({ error: "Timeout" }, { status: 504 });
      }
      await new Promise((r) => setTimeout(r, 800));
      const poll = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: { "Authorization": `Bearer ${REPLICATE_API_KEY}` },
      });
      result = await poll.json();
    }

    if (result.status === "failed") {
      return NextResponse.json({ error: "Échec", detail: result.error }, { status: 500 });
    }

    const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output;
    return NextResponse.json({ url: imageUrl });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur", detail: String(e) }, { status: 500 });
  }
}
