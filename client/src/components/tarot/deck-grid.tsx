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
          className="group cursor-pointer rounded-xl border border-white/15 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-primary/50 hover:scale-105"
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
          <h3 className="font-headline-md mb-2 text-xl font-semibold text-primary">
            {deck.name}
          </h3>
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {deck.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="rounded bg-secondary/80 px-2 py-1 text-xs text-secondary-foreground">
              78 Cards
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-primary opacity-0 transition-colors group-hover:opacity-100 hover:text-primary/80"
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
        className="group cursor-pointer rounded-xl border border-dashed border-white/20 bg-black/40 p-6 backdrop-blur-md transition-all hover:border-primary/50 hover:scale-105"
        onClick={onCreateCustom}
      >
        <div className="mb-4 flex aspect-[3/2] items-center justify-center rounded-lg bg-secondary/30">
          <div className="text-center">
            <Plus className="mx-auto mb-2 text-3xl text-primary" />
            <p className="text-sm text-muted-foreground">Create Custom Deck</p>
          </div>
        </div>
        <h3 className="mb-2 font-headline-md text-xl font-semibold text-primary">
          Your Custom Deck
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Upload your own card designs and create a personalized tarot experience.
        </p>
        <div className="flex items-center justify-between">
          <span className="rounded bg-secondary/80 px-2 py-1 text-xs text-secondary-foreground">
            Upload
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary opacity-0 transition-colors group-hover:opacity-100 hover:text-primary/80"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
