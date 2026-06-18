const FISH_TTS_URL = "https://api.fish.audio/v1/tts";
const DEFAULT_HAL_VOICE_ID = "3892b24d0b11449a8d60eae269d7ee73";

export type FishTtsOptions = {
  text: string;
  referenceId?: string;
  speed?: number;
};

export function isFishAudioConfigured(): boolean {
  return Boolean(process.env.FISH_API_KEY?.trim());
}

export function getHalVoiceId(): string {
  return process.env.FISH_HAL_VOICE_ID?.trim() || DEFAULT_HAL_VOICE_ID;
}

export async function synthesizeHalSpeech(options: FishTtsOptions): Promise<Buffer> {
  const apiKey = process.env.FISH_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("FISH_API_KEY is not configured");
  }

  const text = options.text.trim();
  if (!text) {
    throw new Error("Text is required for speech synthesis");
  }

  const response = await fetch(FISH_TTS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      model: "s2-pro",
    },
    body: JSON.stringify({
      text,
      reference_id: options.referenceId ?? getHalVoiceId(),
      format: "mp3",
      latency: "balanced",
      prosody: {
        speed: options.speed ?? 0.92,
        volume: 0,
      },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    if (response.status === 401) {
      throw new Error("Fish Audio rejected the API key (401). Check FISH_API_KEY.");
    }
    if (response.status === 402) {
      throw new Error(
        "Fish Audio account has no API credits (402). Add billing credits at fish.audio.",
      );
    }
    const snippet = errBody.length > 200 ? `${errBody.slice(0, 200)}…` : errBody;
    throw new Error(`Fish Audio TTS failed (${response.status})${snippet ? `: ${snippet}` : ""}`);
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("audio") && !contentType.includes("octet-stream")) {
    const errBody = await response.text().catch(() => "");
    throw new Error(
      `Fish Audio returned unexpected content-type (${contentType || "unknown"})${errBody ? `: ${errBody.slice(0, 200)}` : ""}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
