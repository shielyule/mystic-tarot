import { motion } from "framer-motion";
import { useHalAudio } from "@/contexts/hal-audio-context";

const WAVE_BARS = [0.35, 0.7, 1, 0.55, 0.85, 0.4] as const;

export default function HalAudioToggle() {
  const { enabled, playing, toggleEnabled } = useHalAudio();

  return (
    <button
      type="button"
      onClick={toggleEnabled}
      aria-pressed={enabled}
      aria-label={enabled ? "Mute HAL audio output" : "Enable HAL audio output"}
      title={enabled ? "AUDIO ON — click to mute" : "AUDIO MUTED — click to enable"}
      className={`group relative flex h-9 min-w-[5.5rem] items-center gap-2 border-2 px-2 transition-none sm:h-10 sm:min-w-[6.5rem] sm:px-3 ${
        enabled
          ? "border-red-600 bg-black text-red-600 hover:bg-red-600 hover:text-black"
          : "border-white/25 bg-black/80 text-white/35 hover:border-white/50 hover:text-white/60"
      }`}
    >
      <span
        className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 ${
          enabled ? "hal-audio-scanlines" : ""
        }`}
        aria-hidden
      />

      <span className="relative flex items-center gap-1.5">
        <span
          className={`h-2 w-2 shrink-0 border ${
            enabled ? "border-red-600 bg-red-600" : "border-white/30 bg-transparent"
          }`}
          aria-hidden
        >
          {enabled && (
            <motion.span
              className="block h-full w-full bg-red-600"
              animate={{ opacity: playing ? [1, 0.35, 1] : [1, 0.55, 1] }}
              transition={{ duration: playing ? 0.55 : 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
        </span>

        <span className="font-label-caps text-[9px] tracking-[0.22em] sm:text-[10px] sm:tracking-[0.28em]">
          {enabled ? "AUDIO" : "MUTED"}
        </span>
      </span>

      <span className="relative ml-auto flex h-4 items-end gap-[2px] sm:h-5" aria-hidden>
        {WAVE_BARS.map((h, i) => (
          <motion.span
            key={i}
            className={`w-[3px] sm:w-[4px] ${enabled ? "bg-red-600 group-hover:bg-black" : "bg-white/20"}`}
            style={{ height: `${h * 100}%` }}
            animate={
              enabled && playing
                ? { scaleY: [h, h * 0.35, h * 1.1, h * 0.5, h] }
                : { scaleY: enabled ? h : h * 0.25 }
            }
            transition={
              enabled && playing
                ? { duration: 0.45 + i * 0.06, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0.2 }
            }
          />
        ))}
      </span>

      {!enabled && (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
          aria-hidden
        >
          <span className="h-[2px] w-[85%] rotate-[-18deg] bg-white/50" />
        </span>
      )}
    </button>
  );
}
