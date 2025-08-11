import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import DeckGrid from "@/components/tarot/deck-grid";
import { type Deck } from "@shared/schema";

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
    // Navigate to home with selected deck
    navigate("/");
  };

  const handleCreateCustom = () => {
    navigate("/cms");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mystic-gold mx-auto mb-4"></div>
          <p className="text-mystic-gold-light">Loading mystical decks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-cinzel text-4xl md:text-5xl font-semibold mb-4 text-mystic-gold">
          Choose Your Deck
        </h2>
        <p className="text-mystic-gold-light text-lg max-w-2xl mx-auto">
          Select from our collection of mystical tarot decks, each with its own unique energy and symbolism
        </p>
      </div>

      {/* Deck Categories */}
      <div className="mb-8">
        <div className="flex justify-center gap-4 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
                selectedFilter === filter.id
                  ? "bg-mystic-gold text-mystic-900"
                  : "bg-mystic-600/80 hover:bg-mystic-600 text-white"
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
