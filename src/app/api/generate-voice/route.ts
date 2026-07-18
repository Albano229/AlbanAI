import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text, voice } = await req.json();
    if (!text) return NextResponse.json({ error: "Texte requis" }, { status: 400 });

    // Map des voix
    const voiceMap: Record<string, string> = {
      alban: "fr-FR-HenriNeural",
      denise: "fr-FR-DeniseNeural",
      eloise: "fr-FR-EloiseNeural",
      henri: "fr-FR-HenriNeural",
      gerard: "fr-FR-GerardNeural",
    };
    const voiceName = voiceMap[voice] || "fr-FR-HenriNeural";

    // 1. Récupérer le token Microsoft Edge TTS
    const tokenRes = await fetch("https://edge.microsoft.com/translate/auth", {
      method: "GET",
    });
    if (!tokenRes.ok) throw new Error("Token échoué: " + tokenRes.status);
    const token = await tokenRes.text();

    // 2. SSML
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="fr-FR">
        <voice name="${voiceName}">
          <prosody rate="0%" pitch="0%">
            ${escapeXml(text)}
          </prosody>
        </voice>
      </speak>
    `.trim();

    // 3. Synthèse audio
    const audioRes = await fetch(
      `https://synthesize.edge.microsoft.com/v1?voice=${voiceName}&language=fr-FR`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/ssml+xml",
          "Authorization": `Bearer ${token}`,
          "X-Microsoft-OutputFormat": "audio-24khz-96kbitrate-mono-mp3",
        },
        body: ssml,
      }
    );

    if (!audioRes.ok) {
      const errText = await audioRes.text();
      throw new Error(`Synthèse échouée: ${audioRes.status} - ${errText}`);
    }

    const audioBuffer = await audioRes.arrayBuffer();

    // 4. Retourner l'audio en MP3 ou WAV
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": audioBuffer.byteLength.toString(),
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (e) {
    console.error("TTS Error:", e);
    return NextResponse.json({ error: "Erreur TTS", detail: String(e) }, { status: 500 });
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
