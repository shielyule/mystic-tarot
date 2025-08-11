import { motion } from "framer-motion";
import { type TarotCard } from "@shared/schema";
import { generateCardInterpretation } from "@/lib/tarot-data";

interface CardReadingProps {
  card: TarotCard;
  isVisible: boolean;
}

export default function CardReading({ card, isVisible }: CardReadingProps) {
  const interpretation = generateCardInterpretation(card);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
      className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-mystic-gold/20"
    >
      <div className="mb-6">
        <h3 className="font-cinzel text-2xl font-semibold text-mystic-gold mb-2">
          {card.name}
        </h3>
        <div className="flex items-center gap-4 text-sm text-mystic-gold-light mb-4">
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
            <h4 className="font-semibold text-mystic-gold mb-2">Upright Meaning</h4>
            <p className="text-mystic-gold-light leading-relaxed font-crimson">
              {card.uprightMeaning}
            </p>
          </div>
        )}
        
        <div>
          <h4 className="font-semibold text-mystic-gold mb-2">Your Reading</h4>
          <p className="text-mystic-gold-light leading-relaxed font-crimson">
            {interpretation}
          </p>
        </div>

        {card.keywords && card.keywords.length > 0 && (
          <div className="border-t border-mystic-gold/20 pt-4">
            <h4 className="font-semibold text-mystic-gold mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-2">
              {card.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="bg-mystic-600/50 text-mystic-gold-light px-3 py-1 rounded-full text-sm"
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
