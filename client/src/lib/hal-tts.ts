let activeAudio: HTMLAudioElement | null = null;
let activeObjectUrl: string | null = null;

function revokeActiveUrl(): void {
  if (activeObjectUrl) {
    URL.revokeObjectURL(activeObjectUrl);
    activeObjectUrl = null;
  }
}

export function stopHalTts(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  revokeActiveUrl();
}

export function isHalTtsPlaying(): boolean {
  return Boolean(activeAudio && !activeAudio.paused && !activeAudio.ended);
}

export type HalTtsSpeakResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "fetch" | "playback"; message: string };

export async function speakHalText(text: string): Promise<HalTtsSpeakResult> {
  const trimmed = text.trim();
  if (!trimmed) {
    return { ok: false, reason: "empty", message: "No text to speak." };
  }

  stopHalTts();

  let response: Response;
  try {
    response = await fetch("/api/tts/speech", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: trimmed }),
    });
  } catch {
    return { ok: false, reason: "fetch", message: "Could not reach the speech service." };
  }

  if (!response.ok) {
    let message = "Speech synthesis failed.";
    try {
      const data = (await response.json()) as { message?: string };
      if (data.message) message = data.message;
    } catch {
      /* ignore */
    }
    return { ok: false, reason: "fetch", message };
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  activeObjectUrl = url;

  const audio = new Audio(url);
  activeAudio = audio;

  return new Promise((resolve) => {
    const cleanup = () => {
      if (activeAudio === audio) activeAudio = null;
      revokeActiveUrl();
    };

    audio.onended = () => {
      cleanup();
      resolve({ ok: true });
    };

    audio.onerror = () => {
      cleanup();
      resolve({ ok: false, reason: "playback", message: "Audio playback failed." });
    };

    void audio.play().catch(() => {
      cleanup();
      resolve({ ok: false, reason: "playback", message: "Browser blocked audio playback." });
    });
  });
}
