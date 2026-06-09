#!/usr/bin/env node
/**
 * Expand docs/deck-generation-pipeline.json with all 78 card prompt entries.
 * Usage: node scripts/generate-deck-prompts.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pipelinePath = path.resolve(__dirname, "../docs/deck-generation-pipeline.json");
const pipeline = JSON.parse(fs.readFileSync(pipelinePath, "utf8"));

const MAJOR = [
  ["the-fool", "The Fool", 0, "Major Arcana 0 — leap into the unknown, airlock threshold"],
  ["the-magician", "The Magician", 1, "Major Arcana I — will and tools, holographic suit symbols"],
  ["the-high-priestess", "The High Priestess", 2, "Major Arcana II — veil between worlds, lunar telemetry"],
  ["the-empress", "The Empress", 3, "Major Arcana III — abundance, life support gardens"],
  ["the-emperor", "The Emperor", 4, "Major Arcana IV — authority, command throne"],
  ["the-hierophant", "The Hierophant", 5, "Major Arcana V — tradition, ritual transmission"],
  ["the-lovers", "The Lovers", 6, "Major Arcana VI — choice, twin signals in phase"],
  ["the-chariot", "The Chariot", 7, "Major Arcana VII — victory, rover crossing void"],
  ["strength", "Strength", 8, "Major Arcana VIII — gentle power, taming solar flare"],
  ["the-hermit", "The Hermit", 9, "Major Arcana IX — lantern in deep space solitude"],
  ["wheel-of-fortune", "Wheel of Fortune", 10, "Major Arcana X — cycles, orbital mechanics"],
  ["justice", "Justice", 11, "Major Arcana XI — balance, calibration scales"],
  ["the-hanged-man", "The Hanged Man", 12, "Major Arcana XII — suspension, inverted perspective"],
  ["death", "Death", 13, "Major Arcana XIII — transformation, stellar rebirth"],
  ["temperance", "Temperance", 14, "Major Arcana XIV — alchemy, fluid mixing in zero-G"],
  ["the-devil", "The Devil", 15, "Major Arcana XV — bondage, chain of dependency"],
  ["the-tower", "The Tower", 16, "Major Arcana XVI — lightning strike on antenna spire"],
  ["the-star", "The Star", 17, "Major Arcana XVII — hope, navigation star pour"],
  ["the-moon", "The Moon", 18, "Major Arcana XVIII — illusion, eclipse and crustacean path"],
  ["the-sun", "The Sun", 19, "Major Arcana XIX — joy, solar radiance through viewport"],
  ["judgement", "Judgement", 20, "Major Arcana XX — awakening, trumpet signal from void"],
  ["the-world", "The World", 21, "Major Arcana XXI — completion, wreath of orbit paths"],
];

const SUITS = [
  { id: "wands", element: "fire", hint: "warm amber ember glow" },
  { id: "cups", element: "water", hint: "teal lunar silver fluid" },
  { id: "swords", element: "air", hint: "cold grey sharp geometry" },
  { id: "pentacles", element: "earth", hint: "copper circuit earth tones" },
];

const RANKS = [
  "ace", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten",
  "page", "knight", "queen", "king",
];

const { stylePrefix, variables, structure } = pipeline.promptTemplate;
const neg = pipeline.styleGuide.negativePromptGlobal;
const border = pipeline.styleGuide.border.description;

function buildPrompt(title, context, symbolism) {
  return `${stylePrefix} Tarot card illustration, ${title}. ${context}. ${symbolism}. Rider-Waite symbolism in space-mission visual language. ${border}. Palette: void black, panel white frame, HAL red accent. 2:3 vertical. ${neg}`;
}

const cards = [];

for (const [slug, title, num, symbolism] of MAJOR) {
  cards.push({
    slug,
    filename: `${slug}.png`,
    phase: "phase2_majorArcana",
    title,
    prompt: buildPrompt(title, `Major Arcana ${num}`, symbolism),
  });
}

for (const suit of SUITS) {
  for (const rank of RANKS) {
    const slug = `${rank}-of-${suit.id}`;
    const title = `${rank.charAt(0).toUpperCase()}${rank.slice(1)} of ${suit.id.charAt(0).toUpperCase()}${suit.id.slice(1)}`;
    cards.push({
      slug,
      filename: `${slug}.png`,
      phase: "phase3_minorArcana",
      suit: suit.id,
      rank,
      title,
      prompt: buildPrompt(
        title,
        `${rank} of ${suit.id}, ${suit.element} element, ${suit.hint}`,
        `${variables.symbolismNotes}`,
      ),
    });
  }
}

pipeline.cards = cards;
fs.writeFileSync(pipelinePath, JSON.stringify(pipeline, null, 2) + "\n");
console.log(`Wrote ${cards.length} card prompts to ${pipelinePath}`);
