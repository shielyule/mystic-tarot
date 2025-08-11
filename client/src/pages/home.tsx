import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Shuffle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import TarotCardComponent from "@/components/tarot/card";
import CardReading from "@/components/tarot/card-reading";
import ShuffleOverlay from "@/components/tarot/shuffle-overlay";
import { type TarotCard, type Reading } from "@shared/schema";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [currentDeckId, setCurrentDeckId] = useState<string>("");

  // Fetch decks to get the default deck
  const { data: decks } = useQuery<any>({
    queryKey: ["/api/decks"],
  });

  // Get the first deck as default
  const defaultDeck = decks?.[0];
  const deckId = currentDeckId || defaultDeck?.id;

  // Fetch cards for the current deck
  const { data: cards = [], isLoading } = useQuery<TarotCard[]>({
    queryKey: ["/api/decks", deckId, "cards"],
    enabled: !!deckId,
  });

  // Fetch recent readings
  const { data: recentReadings = [] } = useQuery<any>({
    queryKey: ["/api/readings"],
  });

  // Create reading mutation
  const createReading = useMutation({
    mutationFn: async (reading: { cardId: string; interpretation: string }) => {
      const response = await fetch("/api/readings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reading),
      });
      if (!response.ok) throw new Error("Failed to create reading");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/readings"] });
    },
  });

  const handleShuffle = async () => {
    setIsShuffling(true);
    setSelectedCard(null);
    setIsCardFlipped(false);

    // Simulate shuffle animation
    setTimeout(() => {
      setIsShuffling(false);
      toast({
        title: "Deck Shuffled",
        description: "The cards have been shuffled. Ready to draw!",
      });
    }, 2000);
  };

  const handleDrawCard = async () => {
    if (!deckId) {
      toast({
        title: "No Deck Selected",
        description: "Please select a deck first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/decks/${deckId}/random-card`);
      if (!response.ok) throw new Error("Failed to draw card");
      
      const card = await response.json();
      setSelectedCard(card);
      
      // Auto-flip card after selection
      setTimeout(() => {
        setIsCardFlipped(true);
        
        // Create reading record
        createReading.mutate({
          cardId: card.id,
          interpretation: "Your mystical reading awaits...",
        });
      }, 500);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to draw a card. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCardFlip = () => {
    setIsCardFlipped(!isCardFlipped);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mystic-gold mx-auto mb-4"></div>
          <p className="text-mystic-gold-light">Loading mystical energies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <ShuffleOverlay isVisible={isShuffling} />
      
      {/* Reading Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-cinzel text-4xl md:text-5xl font-semibold mb-4 text-mystic-gold">
          Your Mystical Reading
        </h2>
        <p className="text-mystic-gold-light text-lg max-w-2xl mx-auto">
          Draw a card from the mystical realm and discover what the universe has to tell you
        </p>
      </div>

      {/* Deck Actions */}
      <div className="flex justify-center gap-4 mb-8">
        <Button
          onClick={handleShuffle}
          disabled={isShuffling}
          className="bg-mystic-600/80 hover:bg-mystic-600 text-white px-6 py-3 backdrop-blur-sm border border-mystic-gold/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-mystic-gold/20"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Shuffle Deck
        </Button>
        <Button
          onClick={handleDrawCard}
          disabled={isShuffling || !deckId}
          className="bg-mystic-gold/90 hover:bg-mystic-gold text-mystic-900 px-6 py-3 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-mystic-gold/40"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Draw Card
        </Button>
      </div>

      {/* Card Display Area */}
      <div className="grid lg:grid-cols-2 gap-8 items-start">
        {/* Card Container */}
        <div className="flex justify-center">
          <TarotCardComponent
            card={selectedCard || undefined}
            cardBackUrl={defaultDeck?.cardBackImageUrl}
            isFlipped={isCardFlipped}
            onFlip={selectedCard ? handleCardFlip : undefined}
          />
        </div>

        {/* Reading Interpretation */}
        {selectedCard && isCardFlipped && (
          <CardReading card={selectedCard} isVisible={true} />
        )}
      </div>

      {/* Card History */}
      {recentReadings.length > 0 && (
        <div className="mt-12">
          <h3 className="font-cinzel text-2xl font-semibold text-center mb-6 text-mystic-gold">
            Recent Readings
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
            {recentReadings.slice(0, 6).map((reading: any) => {
              // Find the card for this reading
              const card = cards.find((c: any) => c.id === reading.cardId);
              if (!card) return null;
              
              return (
                <motion.div
                  key={reading.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-mystic-gold/10 hover:border-mystic-gold/30 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedCard(card);
                    setIsCardFlipped(true);
                  }}
                >
                  <div 
                    className="aspect-[2/3] rounded-md mb-2 bg-cover bg-center"
                    style={{
                      backgroundImage: card.imageUrl ? `url('${card.imageUrl}')` : undefined
                    }}
                  />
                  <p className="text-xs text-mystic-gold-light text-center truncate">
                    {card.name}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
