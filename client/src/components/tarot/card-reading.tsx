import { motion } from "framer-motion";
import { type TarotCard } from "@shared/schema";
import { generateCardInterpretation } from "@/lib/tarot-data";

interface CardReadingProps {
  card: TarotCard;
  isVisible: boolean;
  subjectLine?: string;
}

export default function CardReading({ card, isVisible, subjectLine }: CardReadingProps) {
  const interpretation = generateCardInterpretation(card);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-white/15 bg-black/50 p-6 backdrop-blur-md"
    >
      <div className="mb-6">
        <h3 className="font-headline-md text-headline-md mb-2 text-primary">{card.name}</h3>
        {subjectLine && (
          <p className="font-mono-data mb-3 text-[11px] uppercase tracking-wide text-red-500/90">
            SUBJECT_LOCK: {subjectLine}
          </p>
        )}
        <div className="mb-4 flex flex-wrap items-center gap-3 font-mono-data text-xs text-muted-foreground">
          <span className="capitalize">{card.arcana} Arcana</span>
          <span>•</span>
          <span className="capitalize">{card.suit || "N/A"}</span>
          <span>•</span>
          <span>{card.number !== null ? card.number : "N/A"}</span>
        </div>
      </div>

      <div className="space-y-4">
        {card.uprightMeaning && (
          <div>
            <h4 className="mb-2 font-label-caps text-xs text-primary">Upright meaning</h4>
            <p className="font-body-md text-on-background/95 leading-relaxed">{card.uprightMeaning}</p>
          </div>
        )}

        <div>
          <h4 className="mb-2 font-label-caps text-xs text-primary">Arcana output</h4>
          <p className="font-body-md text-on-background/95 leading-relaxed">{interpretation}</p>
        </div>

        {card.keywords && card.keywords.length > 0 && (
          <div className="border-t border-white/10 pt-4">
            <h4 className="mb-2 font-label-caps text-xs text-primary">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {card.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 font-mono-data text-xs text-primary"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
