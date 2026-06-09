import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import DeckGrid from "@/components/tarot/deck-grid";
import { type Deck } from "@shared/schema";
import { setActiveDeckId } from "@/lib/active-deck";

export default function Decks() {
  const [, navigate] = useLocation();
  const [selectedFilter, setSelectedFilter] = useState("all");

  const { data: decks = [], isLoading } = useQuery<Deck[]>({
    queryKey: ["/api/decks"],
  });

  const filters = [
    { id: "all", label: "All Decks" },
    { id: "classic", label: "Classic" },
    { id: "modern", label: "Modern" },
    { id: "custom", label: "Custom" },
  ];

  const handleDeckSelect = (deck: Deck) => {
    setActiveDeckId(deck.id);
    navigate("/");
  };

  const handleCreateCustom = () => {
    navigate("/cms");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-red-600" />
          <p className="font-mono-data text-muted-foreground">Loading deck modules…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-headline-md text-headline-lg mb-4 font-semibold text-primary md:text-5xl">
          Monolith — deck registry
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Select an active deck module for arcana calibration.
        </p>
      </div>

      {/* Deck Categories */}
      <div className="mb-8">
        <div className="flex justify-center gap-4 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`rounded-lg px-6 py-3 font-semibold transition-colors ${
                selectedFilter === filter.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/90 text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Deck Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DeckGrid
          decks={decks}
          onDeckSelect={handleDeckSelect}
          onCreateCustom={handleCreateCustom}
          selectedFilter={selectedFilter}
        />
      </motion.div>

      {decks.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <p className="text-mystic-gold-light text-lg mb-4">No decks found</p>
          <Button onClick={handleCreateCustom} className="bg-mystic-gold text-mystic-900">
            Create Your First Deck
          </Button>
        </div>
      )}
    </div>
  );
}
