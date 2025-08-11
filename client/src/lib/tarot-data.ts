import { type TarotCard } from "@shared/schema";

export const generateCardInterpretation = (card: TarotCard): string => {
  const interpretations: Record<string, string> = {
    "The Fool": "This card suggests that you are at the beginning of a significant life journey. Trust your instincts and embrace new opportunities with an open heart and mind.",
    "The Magician": "You have all the tools and resources needed to manifest your desires. Focus your will and take decisive action to transform your dreams into reality.",
    "The High Priestess": "Listen to your inner voice and trust your intuition. There are hidden truths and deeper knowledge waiting to be discovered through quiet reflection.",
  };

  return interpretations[card.name] || "The universe is guiding you toward new understanding. Reflect on the symbols and imagery to unlock this card's personal message for you.";
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getCardsByArcana = (cards: TarotCard[]) => {
  return {
    major: cards.filter(card => card.arcana === 'major'),
    minor: cards.filter(card => card.arcana === 'minor'),
  };
};

export const getCardsBySuit = (cards: TarotCard[]) => {
  return {
    wands: cards.filter(card => card.suit === 'wands'),
    cups: cards.filter(card => card.suit === 'cups'),
    swords: cards.filter(card => card.suit === 'swords'),
    pentacles: cards.filter(card => card.suit === 'pentacles'),
  };
};
