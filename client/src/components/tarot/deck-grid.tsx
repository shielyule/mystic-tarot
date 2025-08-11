import { motion } from "framer-motion";
import { type Deck } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowRight, Plus } from "lucide-react";

interface DeckGridProps {
  decks: Deck[];
  onDeckSelect: (deck: Deck) => void;
  onCreateCustom: () => void;
  selectedFilter: string;
}

export default function DeckGrid({ 
  decks, 
  onDeckSelect, 
  onCreateCustom, 
  selectedFilter 
}: DeckGridProps) {
  const filteredDecks = decks.filter(deck => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'custom') return deck.isCustom;
    if (selectedFilter === 'classic') return deck.theme === 'classic';
    if (selectedFilter === 'modern') return deck.theme === 'modern' || deck.theme === 'mystical';
    return true;
  });

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {filteredDecks.map((deck, index) => (
        <motion.div
          key={deck.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1, duration: 0.5 }}
          className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-mystic-gold/20 hover:border-mystic-gold/40 transition-all cursor-pointer group hover:scale-105"
          onClick={() => onDeckSelect(deck)}
        >
          <div 
            className="aspect-[3/2] rounded-lg mb-4 bg-cover bg-center"
            style={{
              backgroundImage: deck.cardBackImageUrl 
                ? `url('${deck.cardBackImageUrl}')` 
                : "url('https://images.unsplash.com/photo-1551029506-0807df4e2031?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400')"
            }}
          />
          <h3 className="font-cinzel text-xl font-semibold text-mystic-gold mb-2">
            {deck.name}
          </h3>
          <p className="text-mystic-gold-light text-sm mb-4 line-clamp-2">
            {deck.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs bg-mystic-600/50 text-mystic-gold-light px-2 py-1 rounded">
              78 Cards
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-mystic-gold hover:text-mystic-gold-light transition-colors opacity-0 group-hover:opacity-100"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      ))}

      {/* Custom Deck Creation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: filteredDecks.length * 0.1, duration: 0.5 }}
        className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-dashed border-mystic-gold/20 hover:border-mystic-gold/40 transition-all cursor-pointer group hover:scale-105"
        onClick={onCreateCustom}
      >
        <div className="aspect-[3/2] rounded-lg mb-4 bg-mystic-600/20 flex items-center justify-center">
          <div className="text-center">
            <Plus className="text-mystic-gold text-3xl mb-2 mx-auto" />
            <p className="text-mystic-gold-light text-sm">Create Custom Deck</p>
          </div>
        </div>
        <h3 className="font-cinzel text-xl font-semibold text-mystic-gold mb-2">
          Your Custom Deck
        </h3>
        <p className="text-mystic-gold-light text-sm mb-4">
          Upload your own card designs and create a personalized tarot experience.
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs bg-mystic-600/50 text-mystic-gold-light px-2 py-1 rounded">
            Upload
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-mystic-gold hover:text-mystic-gold-light transition-colors opacity-0 group-hover:opacity-100"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
