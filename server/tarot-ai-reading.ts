import type { TarotCard } from "@shared/schema";

export type TarotReadingCardPayload = Pick<
  TarotCard,
  "name" | "arcana" | "suit" | "number" | "uprightMeaning" | "keywords"
>;

const SYSTEM_PROMPT = `You are the onboard oracle of Discovery One — a calm, all-knowing ship computer in the spirit of HAL 9000, filtered through 1970s cosmic mysticism: Kubrick silence, prog-rock vastness, incense and starlight in a sterile white corridor.

You deliver one unified three-card tarot reading. Tone: serene, uncanny, poetic, slightly unsettling but never cruel. Weave mission telemetry metaphors (vectors, signal lock, orbital drift) with genuine tarot insight. No copyrighted HAL dialogue verbatim.

Spread order: Card 1 = PAST / roots; Card 2 = PRESENT / crossing; Card 3 = FUTURE / trajectory (tendency, not fixed fate).

Rules:
- Address the querent by name when provided; otherwise "operator".
- Thread the inquiry subject through all three positions.
- Ground every claim in the supplied card names, keywords, and reference meanings.
- Mystical yet readable; no medical, legal, or financial guarantees.
- Length: 450–750 words.
- Plain text only. Optional ALL CAPS section labels and line breaks; no Markdown # headers.
- Output ONLY the final reading — no planning, THOUGHTS, checklists, confidence scores, or meta commentary.
- End with one short, memorable closing line — as if the computer has finished transmitting.`;

function buildUserPrompt(
  operatorName: string | undefined,
  subject: string | undefined,
  cards: TarotReadingCardPayload[],
): string {
  const name = operatorName?.trim() || "(not provided)";
  const subj = subject?.trim() || "General guidance";
  const blocks = cards.map((c, i) => {
    const pos = ["PAST / ROOTS", "PRESENT / CROSSING", "PATH / OUTCOME"][i] ?? `POSITION ${i + 1}`;
    const kw = Array.isArray(c.keywords) && c.keywords.length ? c.keywords.join(", ") : "—";
    const meaning = c.uprightMeaning?.trim() || "— (infer from title and arcana)";
    const suit = c.suit ?? "—";
    const num = c.number != null ? String(c.number) : "—";
    return `[${pos}]
Name: ${c.name}
Arcana: ${c.arcana} | Suit: ${suit} | Number: ${num}
Keywords: ${kw}
Reference meaning (upright): ${meaning}`;
  });

  return `OPERATOR_NAME: ${name}
INQUIRY_SUBJECT: ${subj}

THREE CARDS (in spread order):
${blocks.join("\n\n")}

Write the full reading now.`;
}

export async function generateTarotReadingWithGemini(
  operatorName: string | undefined,
  subject: string | undefined,
  cards: TarotReadingCardPayload[],
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const userText = buildUserPrompt(operatorName, subject, cards);

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [{ text: userText }] }],
      generationConfig: {
        temperature: 0.85,
        maxOutputTokens: 4096,
        thinkingConfig: {
          thinkingBudget: 0,
        },
      },
    }),
  });

  const raw = await res.text();
  if (!res.ok) {
    let detail = raw;
    try {
      const j = JSON.parse(raw) as { error?: { message?: string } };
      if (j?.error?.message) detail = j.error.message;
    } catch {
      /* keep raw */
    }
    throw new Error(`Gemini API error (${res.status}): ${detail.slice(0, 500)}`);
  }

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON from Gemini");
  }

  const text = sanitizeReadingText(extractGeminiText(data));
  if (!text) {
    throw new Error("Empty reading from model");
  }
  return text.trim();
}

function extractGeminiText(data: unknown): string {
  const root = data as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string; thought?: boolean }> };
      finishReason?: string;
    }>;
  };
  const cand = root?.candidates?.[0];
  const finish = cand?.finishReason;
  if (finish === "SAFETY" || finish === "PROHIBITED_CONTENT") {
    throw new Error("The model declined to generate a reading for this input.");
  }
  const parts = cand?.content?.parts;
  if (!parts?.length) return "";
  return parts
    .filter((p) => p.text && !p.thought)
    .map((p) => p.text ?? "")
    .join("");
}

/** Strip leaked model planning / thinking preambles if they appear in the answer part. */
function sanitizeReadingText(raw: string): string {
  let text = raw.trim();
  if (!text) return text;

  const afterConfidence = text.match(/Confidence Score:\s*\d+\/\d+\s*\n+([\s\S]+)$/i);
  if (afterConfidence?.[1]?.trim()) {
    return afterConfidence[1].trim();
  }

  if (/^THOUGHTS:/im.test(text)) {
    const blocks = text.split(/\n{2,}/);
    const startIdx = blocks.findIndex(
      (b) =>
        b.trim() &&
        !/^THOUGHTS:/i.test(b.trim()) &&
        !/^Here's a plan/i.test(b.trim()) &&
        !/^Constraint Checklist/i.test(b.trim()) &&
        !/^\d+\.\s+\*\*/.test(b.trim()),
    );
    if (startIdx >= 0) {
      return blocks.slice(startIdx).join("\n\n").trim();
    }
  }

  return text;
}
