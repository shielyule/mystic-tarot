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
          <Shuffle className="text-6xl text-red-600" />
        </motion.div>
        <h3 className="font-headline-md text-headline-md mb-2 text-primary">Resequencing deck…</h3>
        <p className="font-mono-data text-on-background/80">HAL subsystems optimizing draw order.</p>
      </div>
    </motion.div>
  );
}
