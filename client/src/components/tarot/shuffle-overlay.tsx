import { motion } from "framer-motion";
import { Shuffle } from "lucide-react";

interface ShuffleOverlayProps {
  isVisible: boolean;
}

export default function ShuffleOverlay({ isVisible }: ShuffleOverlayProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="mb-6 flex justify-center"
        >
          <Shuffle className="text-mystic-gold text-6xl" />
        </motion.div>
        <h3 className="font-cinzel text-2xl text-mystic-gold mb-2">
          Shuffling the Cards...
        </h3>
        <p className="text-mystic-gold-light">
          The universe is preparing your reading
        </p>
      </div>
    </motion.div>
  );
}
