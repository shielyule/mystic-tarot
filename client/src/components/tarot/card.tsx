import { useState } from "react";
import { motion } from "framer-motion";
import { type TarotCard } from "@shared/schema";

interface TarotCardProps {
  card?: TarotCard;
  cardBackUrl?: string;
  isFlipped?: boolean;
  onFlip?: () => void;
  className?: string;
}

export default function TarotCardComponent({
  card,
  cardBackUrl = "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600",
  isFlipped = false,
  onFlip,
  className = "",
}: TarotCardProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleCardClick = () => {
    if (isAnimating || !onFlip) return;
    
    setIsAnimating(true);
    onFlip();
    
    setTimeout(() => {
      setIsAnimating(false);
    }, 600);
  };

  return (
    <div className={`perspective-1000 ${className}`}>
      <motion.div
        className="relative w-64 h-96 cursor-pointer"
        onClick={handleCardClick}
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        {/* Card Back */}
        <motion.div
          className={`card-face absolute inset-0 w-full h-full rounded-xl shadow-2xl ${
            isFlipped ? "opacity-0" : "opacity-100"
          }`}
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundImage: `url('${cardBackUrl}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-mystic-600/60 to-mystic-900/80 rounded-xl" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-mystic-gold text-4xl mb-4">🌙</div>
              <p className="text-mystic-gold-light font-cinzel">Mystic Tarot</p>
            </div>
          </div>
          <div className="absolute inset-0 rounded-xl mystical-glow opacity-0 hover:opacity-100 transition-opacity duration-300" />
        </motion.div>

        {/* Card Front */}
        {card && (
          <motion.div
            className={`card-face absolute inset-0 w-full h-full rounded-xl shadow-2xl ${
              isFlipped ? "opacity-100" : "opacity-0"
            }`}
            animate={{ rotateY: isFlipped ? 0 : -180 }}
            transition={{ duration: 0.6 }}
            style={{
              backgroundImage: card.imageUrl ? `url('${card.imageUrl}')` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 rounded-xl" />
            <div className="absolute bottom-4 left-4 right-4">
              <h3 className="font-cinzel text-xl font-semibold text-white mb-1">
                {card.name}
              </h3>
              <p className="text-mystic-gold-light text-sm capitalize">
                {card.arcana} {card.arcana === 'major' ? 'Arcana' : card.suit}
              </p>
              {card.number !== null && (
                <p className="text-mystic-gold-light/70 text-xs">
                  {card.number === 0 ? '0' : card.number}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
