import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useHalLensPulse } from "@/hooks/use-hal-lens-pulse";
import ShuffleOverlay from "@/components/tarot/shuffle-overlay";
import { Input } from "@/components/ui/input";
import { type TarotCard, type Deck, type SpreadReading } from "@shared/schema";
import halLensJpg from "@/assets/hal-lens.jpg";
import {
  HAL_LENS_PULSE_CRITICAL,
  HAL_LENS_PULSE_INTERPRET,
  HAL_LENS_PULSE_READY,
  HAL_LENS_PULSE_SHUFFLE,
  type HalLensIntensity,
} from "@/lib/hal-lens-pulse";
import { getOperatorName, setOperatorName as persistOperatorName } from "@/lib/operator-name";
import { getActiveDeckId, setActiveDeckId } from "@/lib/active-deck";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";

type SpreadCard = TarotCard & { isFlipped: boolean };

const LOCAL_CARD_BACK = "/Cards-png/Roses_and_Lilies_back.jpg";

const SPREAD_POSITIONS = [
  { label: "PAST", sub: "ROOTS" },
  { label: "PRESENT", sub: "CROSSING" },
  { label: "FUTURE", sub: "TRAJECTORY" },
] as const;

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [operatorName, setOperatorNameState] = useState("");
  const [deckIndex, setDeckIndex] = useState(0);
  const [isShuffling, setIsShuffling] = useState(false);
  const [screen, setScreen] = useState<"setup" | "spread">("setup");
  const [spreadCards, setSpreadCards] = useState<SpreadCard[]>([]);
  const [humanErrorPulse, setHumanErrorPulse] = useState(false);
  const [aiSpreadReading, setAiSpreadReading] = useState<string | null>(null);
  const [aiSpreadReadingError, setAiSpreadReadingError] = useState<string | null>(null);
  const [aiSpreadReadingLoading, setAiSpreadReadingLoading] = useState(false);
  const completedAiSpreadSigRef = useRef<string | null>(null);

  const { data: decks = [], isLoading: decksLoading } = useQuery<Deck[]>({
    queryKey: ["/api/decks"],
  });

  useEffect(() => {
    if (decks.length === 0) return;
    const activeId = getActiveDeckId();
    if (activeId) {
      const idx = decks.findIndex((d) => d.id === activeId);
      if (idx >= 0) {
        setDeckIndex(idx);
        return;
      }
    }
    setDeckIndex((i) => Math.min(i, Math.max(0, decks.length - 1)));
  }, [decks]);

  useEffect(() => {
    setOperatorNameState(getOperatorName());
  }, []);

  const activeDeck = decks[deckIndex];
  const deckId = activeDeck?.id;

  useEffect(() => {
    if (activeDeck?.id) setActiveDeckId(activeDeck.id);
  }, [activeDeck?.id]);

  const { data: cards = [], isLoading: cardsLoading } = useQuery<TarotCard[]>({
    queryKey: ["/api/decks", deckId, "cards"],
    enabled: !!deckId,
  });

  const { data: spreadHistory = [] } = useQuery<SpreadReading[]>({
    queryKey: ["/api/spread-readings"],
    enabled: screen === "setup" && !!user,
  });

  const handleShuffle = () => {
    setIsShuffling(true);
    setSpreadCards([]);
    setScreen("setup");
    setTimeout(() => {
      setIsShuffling(false);
      toast({ title: "Deck resequenced", description: "Calibration stack updated." });
    }, 2000);
  };

  const handleInitiate = async () => {
    if (!deckId || cards.length < 3) {
      toast({
        title: "Deck module unavailable",
        description: "Need at least 3 cards to run this spread.",
        variant: "destructive",
      });
      setHumanErrorPulse(true);
      window.setTimeout(() => setHumanErrorPulse(false), 2600);
      return;
    }

    const shuffled = [...cards]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
      .map((card) => ({ ...card, isFlipped: false }));
    setSpreadCards(shuffled);
    setAiSpreadReading(null);
    setAiSpreadReadingError(null);
    completedAiSpreadSigRef.current = null;
    setScreen("spread");
  };

  const goDeck = (delta: number) => {
    if (decks.length === 0) return;
    setDeckIndex((i) => {
      const next = (i + delta + decks.length) % decks.length;
      const nextDeck = decks[next];
      if (nextDeck?.id) setActiveDeckId(nextDeck.id);
      return next;
    });
    setSpreadCards([]);
    setScreen("setup");
  };

  const revealCard = (cardId: string) => {
    const target = spreadCards.find((card) => card.id === cardId);
    if (!target || target.isFlipped) return;

    setSpreadCards((current) =>
      current.map((card) => (card.id === cardId ? { ...card, isFlipped: true } : card)),
    );
  };

  const isLoading = decksLoading || (deckId ? cardsLoading : false);

  const lensMotion = useHalLensPulse();

  /** CSS pulse: duration + `data-hal-intensity` (glow / core keyframes in index.css). */
  const halLensVisual = useMemo((): {
    duration: string;
    intensity: HalLensIntensity;
  } => {
    if (humanErrorPulse) {
      return { duration: HAL_LENS_PULSE_CRITICAL, intensity: "high" };
    }
    if (isShuffling) {
      return { duration: HAL_LENS_PULSE_SHUFFLE, intensity: "medium" };
    }
    if (screen === "spread" || aiSpreadReadingLoading) {
      return { duration: HAL_LENS_PULSE_INTERPRET, intensity: "high" };
    }
    return { duration: HAL_LENS_PULSE_READY, intensity: "subtle" };
  }, [humanErrorPulse, isShuffling, screen, aiSpreadReadingLoading]);

  const systemHealthNominal = useMemo(() => {
    return (
      operatorName.trim().length > 0 &&
      subject.trim().length > 0 &&
      !!deckId &&
      cards.length >= 3
    );
  }, [operatorName, subject, deckId, cards.length]);

  const allSpreadCardsRevealed =
    spreadCards.length === 3 && spreadCards.every((c) => c.isFlipped);

  const revealedCount = spreadCards.filter((c) => c.isFlipped).length;

  useEffect(() => {
    if (!allSpreadCardsRevealed || screen !== "spread") {
      setAiSpreadReading(null);
      setAiSpreadReadingError(null);
      setAiSpreadReadingLoading(false);
      completedAiSpreadSigRef.current = null;
      return;
    }

    const sig =
      spreadCards.map((c) => c.id).join("|") +
      "§" +
      subject.trim() +
      "§" +
      operatorName.trim();
    if (completedAiSpreadSigRef.current === sig) return;

    const ac = new AbortController();
    setAiSpreadReadingLoading(true);
    setAiSpreadReadingError(null);
    setAiSpreadReading(null);

    const cardsPayload = spreadCards.map((c) => ({
      name: c.name,
      arcana: c.arcana,
      suit: c.suit,
      number: c.number,
      uprightMeaning: c.uprightMeaning,
      keywords: Array.isArray(c.keywords)
        ? c.keywords.filter((k): k is string => typeof k === "string")
        : undefined,
    }));

    (async () => {
      try {
        const response = await fetch("/api/tarot-reading", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            operatorName: operatorName.trim() || undefined,
            subject: subject.trim() || undefined,
            deckId: deckId ?? undefined,
            deckName: activeDeck?.name ?? undefined,
            cards: cardsPayload,
          }),
          signal: ac.signal,
        });
        const data = (await response.json().catch(() => ({}))) as { reading?: string; message?: string };
        if (ac.signal.aborted) return;
        if (!response.ok) {
          throw new Error(data.message || `Reading request failed (${response.status})`);
        }
        setAiSpreadReading(typeof data.reading === "string" ? data.reading : "");
        completedAiSpreadSigRef.current = sig;
        if (user) {
          queryClient.invalidateQueries({ queryKey: ["/api/spread-readings"] });
        }
      } catch (e) {
        if (ac.signal.aborted || (e instanceof DOMException && e.name === "AbortError")) return;
        setAiSpreadReadingError(e instanceof Error ? e.message : "Reading failed");
      } finally {
        if (!ac.signal.aborted) setAiSpreadReadingLoading(false);
      }
    })();

    return () => ac.abort();
  }, [allSpreadCardsRevealed, screen, spreadCards, subject, operatorName, deckId, activeDeck?.name, queryClient, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-red-600" />
          <p className="font-mono-data text-on-background">Loading arcana buffers…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pb-24 pt-6 sm:px-6 sm:pt-12">
      <ShuffleOverlay isVisible={isShuffling} />

      {screen === "setup" ? (
        <>
      <div className="mb-10 flex w-full flex-col items-center sm:mb-12">
        <div
          className="relative flex h-40 w-40 shrink-0 flex-col items-center overflow-visible sm:h-48 sm:w-48"
          style={
            {
              "--hal-pulse-duration": halLensVisual.duration,
            } as CSSProperties
          }
          data-hal-intensity={halLensVisual.intensity}
        >
          <div
            key={`${halLensVisual.duration}-${halLensVisual.intensity}`}
            className="hal-lens-glow-pulse pointer-events-none absolute left-1/2 top-1/2 z-0 h-[108%] w-[108%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent"
            aria-hidden
          />
          <motion.div
            className="relative z-[1] h-full w-full overflow-hidden rounded-full border-[6px] border-[#333] bg-black"
            style={{ aspectRatio: "1 / 1" }}
            animate={lensMotion.animate}
            transition={lensMotion.transition}
            onAnimationComplete={lensMotion.onAnimationComplete}
          >
            <div className="hal-lens-core-pulse pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-full">
              <img
                alt="HAL 9000 optical sensor"
                width={256}
                height={256}
                decoding="async"
                src={halLensJpg}
                className="pointer-events-none absolute left-1/2 top-1/2 h-[122%] w-[122%] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover object-center"
              />
            </div>
          </motion.div>
        </div>
        <div className="mt-5 px-2 text-center">
          <div className="font-mono-data text-xs font-bold uppercase tracking-[0.3em] text-red-600">
            HAL_9000_ACTIVE
          </div>
        </div>
      </div>

      <section className="mb-10 w-full sm:mb-12">
        <div className="mb-4">
          <label className="font-label-caps mb-2 block text-muted-foreground" htmlFor="operator-name">
            OPERATOR_NAME_INPUT
          </label>
          <div className="font-mono-data mb-2 text-[10px] uppercase tracking-wide text-tertiary-fixed-dim opacity-60">
            TERMINAL_00 // ID_REGISTER
          </div>
        </div>
        <Input
          id="operator-name"
          type="text"
          autoComplete="name"
          maxLength={120}
          value={operatorName}
          onChange={(e) => {
            const v = e.target.value.slice(0, 120);
            setOperatorNameState(v);
            persistOperatorName(v);
          }}
          placeholder="ENTER YOUR NAME"
          className="font-mono-data h-11 rounded-none border-0 border-b-2 border-white bg-transparent px-0 uppercase tracking-wide text-white placeholder:text-surface-container-highest focus-visible:border-red-600 focus-visible:ring-0 focus-visible:ring-offset-0"
        />
      </section>

      <section className="mb-12 w-full sm:mb-16">
        <div className="mb-4">
          <label className="font-label-caps mb-2 block text-muted-foreground" htmlFor="query-subject">
            QUERY_SUBJECT_INPUT
          </label>
          <div className="font-mono-data mb-2 text-[10px] uppercase tracking-wide text-tertiary-fixed-dim opacity-60">
            TERMINAL_01 // SECURE_LINE
          </div>
        </div>
        <div className="group relative">
          <textarea
            id="query-subject"
            rows={3}
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="WHAT SUBJECT WOULD YOU LIKE YOUR FORTUNE TOLD ABOUT?"
            className="font-mono-data w-full resize-none border-0 border-b-2 border-white bg-transparent p-0 uppercase text-white placeholder:text-surface-container-highest focus:border-red-600 focus:outline-none focus:ring-0"
          />
          <div className="animate-pulse font-mono-data absolute bottom-0 right-0 p-2 text-[10px] text-red-600">
            AWAITING_DATA...
          </div>
        </div>
      </section>

      <section className="mb-12 w-full sm:mb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-label-caps text-sm text-white">SELECT_DECK_MODULE</h2>
            <div className="mt-1 h-1 w-12 bg-red-600" />
          </div>
          <span className="font-mono-data text-[10px] uppercase text-tertiary">
            {decks.length}_DEVICES_DETECTED
          </span>
        </div>
        <div className="group relative flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => goDeck(-1)}
            disabled={decks.length < 2}
            className="z-10 border border-white/30 bg-black/50 p-2 text-white transition-colors hover:border-red-600 hover:text-red-600 disabled:opacity-30"
            aria-label="Previous deck"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <div className="relative w-44 border-2 border-white bg-black/40 p-2 shadow-[0_0_20px_rgba(255,255,255,0.05)] backdrop-blur-sm sm:w-48">
            <div className="relative aspect-[2/3] overflow-hidden bg-black">
              {activeDeck ? (
                <>
                  <img
                    alt={activeDeck.name}
                    className="h-full w-full object-contain brightness-90 contrast-125"
                    src={LOCAL_CARD_BACK}
                  />
                  <div className="pointer-events-none absolute inset-0 border border-white/20" />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </>
              ) : (
                <div className="flex h-full items-center justify-center font-mono-data text-[10px] text-on-surface-variant">
                  NO_DECK_SIGNAL
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-col">
              <div className="font-label-caps text-[10px] tracking-widest text-red-600">
                {(activeDeck?.name || "AWAITING_DECK").toUpperCase().replace(/\s+/g, "_")}
              </div>
              <div className="font-mono-data text-[8px] uppercase text-white opacity-60">
                {activeDeck ? "ACTIVE_MODULE_LOADED" : "OFFLINE"}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => goDeck(1)}
            disabled={decks.length < 2}
            className="z-10 border border-white/30 bg-black/50 p-2 text-white transition-colors hover:border-red-600 hover:text-red-600 disabled:opacity-30"
            aria-label="Next deck"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
        <button
          type="button"
          onClick={handleShuffle}
          disabled={isShuffling || !deckId}
          className="font-mono-data mt-4 w-full border border-white/20 py-2 text-[10px] uppercase tracking-widest text-on-surface-variant transition-colors hover:border-red-600 hover:text-red-500 disabled:opacity-40"
        >
          RESEQUENCE_DECK_STACK
        </button>
      </section>

      <button
        type="button"
        onClick={handleInitiate}
        disabled={isShuffling || !deckId}
        className="red-glow-btn group relative w-full overflow-hidden border-2 border-red-600 bg-black py-5 font-label-caps tracking-[0.24em] text-red-600 transition-all active:bg-white active:text-black disabled:opacity-40 sm:py-6 sm:tracking-[0.4em]"
      >
        <span className="relative z-10">INITIATE 3-CARD SPREAD</span>
        <div className="absolute inset-0 translate-y-full bg-red-600 opacity-10 transition-transform duration-300 group-hover:translate-y-0" />
      </button>

      <div className="mt-12 flex items-center gap-4">
        <div
          className={`h-2 w-2 shrink-0 ${systemHealthNominal ? "bg-green-500" : "animate-pulse bg-red-600"}`}
          aria-hidden
        />
        <span className="font-mono-data text-[10px] tracking-widest text-surface-container-highest">
          SYSTEM_HEALTH: OPTIMAL
        </span>
      </div>

      {user && spreadHistory.length > 0 ? (
        <section className="mt-16 w-full">
          <h3 className="font-label-caps mb-6 text-center text-sm tracking-widest text-white">
            TELEMETRY_ARCHIVE
          </h3>
          <ul className="space-y-4">
            {spreadHistory.slice(0, 8).map((entry) => (
              <li
                key={entry.id}
                className="border border-white/10 border-l-2 border-l-red-600/60 bg-black/30 px-4 py-3"
              >
                <div className="mb-1 font-mono-data text-[9px] uppercase tracking-widest text-red-500/80">
                  {entry.timestamp
                    ? new Date(entry.timestamp).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "—"}
                  {entry.operatorName ? ` · ${entry.operatorName}` : ""}
                </div>
                {entry.subject ? (
                  <p className="mb-2 font-mono-data text-[10px] uppercase text-tertiary-fixed-dim">
                    QUERY: {entry.subject}
                  </p>
                ) : null}
                {Array.isArray(entry.cardNames) && entry.cardNames.length > 0 ? (
                  <p className="mb-2 font-mono-data text-[10px] text-on-background/70">
                    {entry.cardNames.join(" · ")}
                  </p>
                ) : null}
                <p className="line-clamp-4 whitespace-pre-wrap font-mono-data text-xs leading-relaxed text-on-background/85">
                  {entry.reading}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : !user ? (
        <section className="mt-16 w-full border border-white/10 border-l-2 border-l-red-600/40 bg-black/30 px-5 py-6 text-center">
          <h3 className="font-label-caps mb-2 text-sm tracking-widest text-white">TELEMETRY_ARCHIVE</h3>
          <p className="mb-4 font-mono-data text-xs text-white/55">
            Sign in to save readings and unlock Monolith deck selection and Telemetry CMS.
          </p>
          <Link
            href="/login?next=/"
            className="inline-block border-2 border-red-600 px-4 py-2 font-label-caps text-[10px] tracking-widest text-red-600 hover:bg-red-600 hover:text-black"
          >
            REQUEST_ACCESS
          </Link>
        </section>
      ) : null}
        </>
      ) : (
        <section className="w-full">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-label-caps text-sm text-white">THREE_CARD_SPREAD</h2>
            <button
              type="button"
              onClick={() => setScreen("setup")}
              className="font-mono-data text-[10px] uppercase tracking-widest text-red-500"
            >
              BACK_TO_SETUP
            </button>
          </div>

          <div className="mb-3 text-center font-mono-data text-[10px] uppercase tracking-widest text-tertiary-fixed-dim">
            {subject ? `QUERY: ${subject}` : "QUERY: GENERAL_GUIDANCE"}
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {spreadCards.map((card, index) => (
              <button
                key={card.id}
                type="button"
                onClick={() => revealCard(card.id)}
                disabled={card.isFlipped}
                className="group rounded-md border border-white/20 bg-black/40 p-2 text-left disabled:cursor-default"
              >
                <div className="mb-1 text-center font-mono-data text-[8px] uppercase tracking-widest text-red-500/90">
                  {SPREAD_POSITIONS[index]?.label ?? `POS_${index + 1}`}
                </div>
                <div className="mb-1 text-center font-mono-data text-[7px] uppercase tracking-wide text-tertiary-fixed-dim opacity-70">
                  {SPREAD_POSITIONS[index]?.sub}
                </div>
                <div
                  className="aspect-[2/3] w-full bg-contain bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url('${card.isFlipped ? card.imageUrl : LOCAL_CARD_BACK}')`,
                  }}
                />
                <p className="mt-2 truncate text-center font-mono-data text-[10px] uppercase text-on-background">
                  {card.isFlipped ? card.name : "FACE_DOWN"}
                </p>
              </button>
            ))}
          </div>

          <div
            className="mt-6 border border-white/15 border-l-2 border-l-red-600/80 bg-black/50 px-4 py-4 backdrop-blur-sm sm:mt-8 sm:px-6 sm:py-5"
            role="region"
            aria-live="polite"
            aria-label="Reading panel"
          >
            <div className="mb-2 font-mono-data text-[9px] uppercase tracking-[0.2em] text-red-500/90">
              {allSpreadCardsRevealed
                ? "ORACLE_SYNTHESIS // NEURAL_BUFFER"
                : "SENSOR_ANALYSIS // AWAITING_REVEAL"}
            </div>
            {!allSpreadCardsRevealed ? (
              <p className="font-mono-data text-sm leading-relaxed text-on-background/90">
                Please click a card to turn it over and reveal.
                {revealedCount > 0 ? (
                  <span className="mt-2 block text-[10px] uppercase tracking-widest text-tertiary-fixed-dim">
                    {revealedCount} of 3 symbols exposed
                  </span>
                ) : null}
              </p>
            ) : aiSpreadReadingLoading ? (
              <p className="font-mono-data text-sm leading-relaxed text-on-background/85 animate-pulse">
                Integrating operator profile, inquiry channel, and triad glyph set. Stand by…
              </p>
            ) : aiSpreadReadingError ? (
              <p className="font-mono-data text-sm leading-relaxed text-red-500">{aiSpreadReadingError}</p>
            ) : aiSpreadReading ? (
              <div className="max-h-[min(70vh,36rem)] overflow-y-auto pr-1">
                <p className="whitespace-pre-wrap font-mono-data text-sm leading-relaxed text-on-background/95">
                  {aiSpreadReading}
                </p>
              </div>
            ) : null}
          </div>
        </section>
      )}
    </div>
  );
}
