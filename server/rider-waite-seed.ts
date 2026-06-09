/** Rider-Waite-Smith upright/reversed meanings keyed by Cards-png filename slug (no extension). */

export type CardMeaningSeed = {
  uprightMeaning: string;
  reversedMeaning: string;
  keywords: string[];
};

const MAJOR: Record<string, CardMeaningSeed> = {
  "the-fool": {
    uprightMeaning:
      "New beginnings, innocence, spontaneity, and a free spirit. A leap of faith into the unknown with optimism.",
    reversedMeaning: "Recklessness, fear of change, holding back, or naivety that ignores warning signs.",
    keywords: ["beginnings", "innocence", "adventure", "faith", "potential"],
  },
  "the-magician": {
    uprightMeaning:
      "Manifestation, resourcefulness, power, and inspired action. You have the tools; focus will turns vision into reality.",
    reversedMeaning: "Manipulation, poor planning, untapped talents, or scattered intent.",
    keywords: ["willpower", "skill", "manifestation", "focus", "action"],
  },
  "the-high-priestess": {
    uprightMeaning:
      "Intuition, sacred knowledge, the subconscious, and inner voice. Answers lie beneath the surface—listen and wait.",
    reversedMeaning: "Secrets withheld, disconnection from intuition, or surface-level thinking.",
    keywords: ["intuition", "mystery", "inner voice", "stillness", "wisdom"],
  },
  "the-empress": {
    uprightMeaning:
      "Abundance, nurturing, creativity, and sensual pleasure. Growth flourishes through care, beauty, and patience.",
    reversedMeaning: "Creative block, dependence, smothering, or neglect of self-care.",
    keywords: ["abundance", "nurture", "creativity", "fertility", "comfort"],
  },
  "the-emperor": {
    uprightMeaning:
      "Authority, structure, stability, and fatherly protection. Discipline and clear boundaries build lasting order.",
    reversedMeaning: "Domination, rigidity, abuse of power, or lack of discipline.",
    keywords: ["authority", "structure", "leadership", "stability", "control"],
  },
  "the-hierophant": {
    uprightMeaning:
      "Tradition, spiritual wisdom, institutions, and shared belief. Guidance comes through established paths and mentors.",
    reversedMeaning: "Rebellion against convention, personal spirituality, or challenging outdated rules.",
    keywords: ["tradition", "guidance", "belief", "conformity", "education"],
  },
  "the-lovers": {
    uprightMeaning:
      "Love, harmony, values alignment, and meaningful choice. Relationships and decisions reflect the heart's truth.",
    reversedMeaning: "Disharmony, misaligned values, temptation, or avoidance of commitment.",
    keywords: ["love", "union", "choice", "harmony", "values"],
  },
  "the-chariot": {
    uprightMeaning:
      "Determination, willpower, victory, and controlled momentum. Opposing forces are harnessed through focus and confidence.",
    reversedMeaning: "Lack of direction, aggression, defeat, or loss of control.",
    keywords: ["willpower", "victory", "drive", "control", "ambition"],
  },
  strength: {
    uprightMeaning:
      "Courage, compassion, inner strength, and gentle influence. True power softens what force cannot tame.",
    reversedMeaning: "Self-doubt, weakness, raw anger, or insecurity masked as strength.",
    keywords: ["courage", "patience", "compassion", "inner strength", "influence"],
  },
  "the-hermit": {
    uprightMeaning:
      "Soul-searching, solitude, introspection, and inner guidance. Withdraw to find the lantern light of wisdom.",
    reversedMeaning: "Isolation, loneliness, refusal of help, or avoiding necessary reflection.",
    keywords: ["solitude", "introspection", "guidance", "wisdom", "search"],
  },
  "wheel-of-fortune": {
    uprightMeaning:
      "Cycles, destiny, turning points, and good luck. Change is in motion—adapt and ride the wheel's rise.",
    reversedMeaning: "Bad luck, resistance to change, or feeling stuck in a downturn.",
    keywords: ["destiny", "cycles", "change", "luck", "karma"],
  },
  justice: {
    uprightMeaning:
      "Fairness, truth, cause and effect, and clear judgment. Accountability and honesty restore balance.",
    reversedMeaning: "Unfairness, dishonesty, bias, or evading responsibility.",
    keywords: ["justice", "truth", "balance", "accountability", "law"],
  },
  "the-hanged-man": {
    uprightMeaning:
      "Pause, surrender, new perspective, and voluntary sacrifice. Let go to see what was hidden.",
    reversedMeaning: "Stalling, martyrdom, fear of sacrifice, or refusing a needed shift in view.",
    keywords: ["surrender", "perspective", "pause", "release", "insight"],
  },
  death: {
    uprightMeaning:
      "Endings, transformation, transition, and release. Something must die so something new can be born.",
    reversedMeaning: "Resistance to change, stagnation, or clinging to the past.",
    keywords: ["transformation", "endings", "renewal", "release", "change"],
  },
  temperance: {
    uprightMeaning:
      "Balance, moderation, patience, and purposeful blending. Healing comes through harmony and measured steps.",
    reversedMeaning: "Imbalance, excess, impatience, or conflicting extremes.",
    keywords: ["balance", "moderation", "patience", "harmony", "healing"],
  },
  "the-devil": {
    uprightMeaning:
      "Bondage, shadow, addiction, and materialism. Chains may be self-made—awareness loosens their hold.",
    reversedMeaning: "Breaking free, reclaiming power, or confronting denial.",
    keywords: ["shadow", "temptation", "attachment", "materialism", "liberation"],
  },
  "the-tower": {
    uprightMeaning:
      "Sudden upheaval, revelation, and the collapse of false structures. Truth strikes lightning—rebuild on honesty.",
    reversedMeaning: "Avoided disaster, fear of change, or clinging to a crumbling facade.",
    keywords: ["upheaval", "revelation", "breakthrough", "chaos", "awakening"],
  },
  "the-star": {
    uprightMeaning:
      "Hope, inspiration, serenity, and renewed faith. After storm, calm waters and a guiding light return.",
    reversedMeaning: "Despair, lack of faith, disconnection, or dimmed optimism.",
    keywords: ["hope", "healing", "inspiration", "serenity", "renewal"],
  },
  "the-moon": {
    uprightMeaning:
      "Illusion, intuition, dreams, and the unconscious. Not all is clear—navigate mystery with instinct.",
    reversedMeaning: "Confusion lifting, fear faced, or secrets brought to light.",
    keywords: ["illusion", "intuition", "dreams", "mystery", "subconscious"],
  },
  "the-sun": {
    uprightMeaning:
      "Joy, success, vitality, and clarity. Warmth, truth, and celebration illuminate the path ahead.",
    reversedMeaning: "Temporary gloom, delayed success, or joy muted by ego.",
    keywords: ["joy", "success", "vitality", "clarity", "celebration"],
  },
  judgement: {
    uprightMeaning:
      "Reflection, reckoning, awakening, and absolution. A call to rise renewed and answer your higher purpose.",
    reversedMeaning: "Self-doubt, ignoring the call, or harsh self-judgment.",
    keywords: ["awakening", "reckoning", "renewal", "purpose", "absolution"],
  },
  "the-world": {
    uprightMeaning:
      "Completion, integration, accomplishment, and wholeness. A cycle closes; you stand at the threshold of mastery.",
    reversedMeaning: "Incomplete closure, shortcuts, or fear of finishing the journey.",
    keywords: ["completion", "integration", "travel", "wholeness", "achievement"],
  },
};

const SUIT_THEMES: Record<
  string,
  { element: string; domain: string; upright: string; reversed: string; keywords: string[] }
> = {
  wands: {
    element: "fire",
    domain: "passion, creativity, and enterprise",
    upright: "Energy, inspiration, and bold initiative in the realm of fire.",
    reversed: "Blocked passion, burnout, delays, or misdirected ambition.",
    keywords: ["passion", "creativity", "action", "ambition", "energy"],
  },
  cups: {
    element: "water",
    domain: "emotion, relationships, and intuition",
    upright: "Feeling, connection, and intuitive flow in the realm of water.",
    reversed: "Emotional turmoil, withdrawal, or unspoken heartache.",
    keywords: ["emotion", "love", "intuition", "relationships", "empathy"],
  },
  swords: {
    element: "air",
    domain: "thought, conflict, and truth",
    upright: "Clarity, decision, and mental focus in the realm of air.",
    reversed: "Confusion, harsh words, anxiety, or avoided truth.",
    keywords: ["intellect", "truth", "conflict", "decision", "clarity"],
  },
  pentacles: {
    element: "earth",
    domain: "work, body, and material security",
    upright: "Practical effort, resources, and steady growth in the realm of earth.",
    reversed: "Financial worry, stagnation, or neglect of the material plane.",
    keywords: ["work", "prosperity", "health", "craft", "stability"],
  },
};

const RANK_NAMES: Record<string, string> = {
  ace: "Ace",
  two: "Two",
  three: "Three",
  four: "Four",
  five: "Five",
  six: "Six",
  seven: "Seven",
  eight: "Eight",
  nine: "Nine",
  ten: "Ten",
  page: "Page",
  knight: "Knight",
  queen: "Queen",
  king: "King",
};

/** Pip-specific nuance (2–10) per suit — Rider-Waite traditional themes, condensed. */
const PIP_NUANCE: Record<string, Record<number, CardMeaningSeed>> = {
  wands: {
    2: { uprightMeaning: "Planning, future vision, and decisions about direction.", reversedMeaning: "Fear of unknown, lack of planning, or playing it too safe.", keywords: ["planning", "decisions", "discovery", "partnership", "vision"] },
    3: { uprightMeaning: "Expansion, foresight, and momentum building.", reversedMeaning: "Delays, obstacles, or lack of foresight.", keywords: ["expansion", "progress", "collaboration", "opportunity", "momentum"] },
    4: { uprightMeaning: "Celebration, harmony, homecoming, and stable foundation.", reversedMeaning: "Transition, lack of support, or shaky foundations.", keywords: ["celebration", "home", "community", "stability", "joy"] },
    5: { uprightMeaning: "Competition, conflict, and standing your ground.", reversedMeaning: "Avoiding conflict, inner tension, or resolution.", keywords: ["conflict", "rivalry", "challenge", "assertion", "tension"] },
    6: { uprightMeaning: "Victory, public recognition, and pride in achievement.", reversedMeaning: "Private success, ego check, or delayed recognition.", keywords: ["victory", "recognition", "pride", "success", "leadership"] },
    7: { uprightMeaning: "Perseverance, defensive strength, and holding your position.", reversedMeaning: "Overwhelm, giving up, or lack of conviction.", keywords: ["perseverance", "defense", "challenge", "courage", "conviction"] },
    8: { uprightMeaning: "Rapid movement, swift action, and news arriving.", reversedMeaning: "Delays, frustration, or miscommunication.", keywords: ["speed", "movement", "action", "travel", "progress"] },
    9: { uprightMeaning: "Resilience, courage, and nearing the finish line.", reversedMeaning: "Exhaustion, paranoia, or refusing to delegate.", keywords: ["resilience", "courage", "persistence", "boundaries", "strength"] },
    10: { uprightMeaning: "Burden, responsibility, and carrying too much alone.", reversedMeaning: "Release of burden, delegation, or collapse under pressure.", keywords: ["burden", "responsibility", "stress", "completion", "overload"] },
  },
  cups: {
    2: { uprightMeaning: "Unified love, partnership, and mutual attraction.", reversedMeaning: "Imbalance, breakup, or misaligned desires.", keywords: ["partnership", "unity", "love", "connection", "harmony"] },
    3: { uprightMeaning: "Friendship, community, and joyful celebration.", reversedMeaning: "Gossip, isolation, or overindulgence.", keywords: ["friendship", "celebration", "community", "creativity", "joy"] },
    4: { uprightMeaning: "Contemplation, apathy, and reevaluation of blessings.", reversedMeaning: "New awareness, acceptance, or renewed motivation.", keywords: ["contemplation", "apathy", "meditation", "reevaluation", "withdrawal"] },
    5: { uprightMeaning: "Loss, grief, and focusing on what is missing.", reversedMeaning: "Acceptance, moving on, or finding silver linings.", keywords: ["loss", "grief", "regret", "disappointment", "healing"] },
    6: { uprightMeaning: "Nostalgia, innocence, and memories of the past.", reversedMeaning: "Living in the past, rose-tinted memory, or letting go.", keywords: ["nostalgia", "innocence", "memories", "childhood", "kindness"] },
    7: { uprightMeaning: "Choices, fantasy, and many tempting options.", reversedMeaning: "Clarity, commitment, or avoiding illusion.", keywords: ["choices", "fantasy", "illusion", "wishful thinking", "options"] },
    8: { uprightMeaning: "Walking away, seeking deeper meaning, and leaving the familiar.", reversedMeaning: "Fear of change, return to comfort, or stagnation.", keywords: ["withdrawal", "search", "disillusionment", "transition", "letting go"] },
    9: { uprightMeaning: "Contentment, satisfaction, and emotional fulfillment.", reversedMeaning: "Inner dissatisfaction, smugness, or unmet wishes.", keywords: ["contentment", "satisfaction", "gratitude", "wish fulfilled", "pleasure"] },
    10: { uprightMeaning: "Harmony, family bliss, and lasting emotional joy.", reversedMeaning: "Broken harmony, domestic tension, or misaligned values.", keywords: ["family", "harmony", "joy", "legacy", "fulfillment"] },
  },
  swords: {
    2: { uprightMeaning: "Difficult choice, stalemate, and blocked decision.", reversedMeaning: "Indecision ending, information revealed, or forced choice.", keywords: ["indecision", "stalemate", "balance", "avoidance", "choice"] },
    3: { uprightMeaning: "Heartbreak, sorrow, and painful truth.", reversedMeaning: "Recovery, forgiveness, or releasing grief.", keywords: ["heartbreak", "sorrow", "pain", "separation", "truth"] },
    4: { uprightMeaning: "Rest, recovery, and contemplative retreat.", reversedMeaning: "Restlessness, burnout, or forced return to activity.", keywords: ["rest", "recovery", "contemplation", "truce", "healing"] },
    5: { uprightMeaning: "Conflict, defeat, and hollow victory.", reversedMeaning: "Reconciliation, learning from loss, or walking away.", keywords: ["conflict", "defeat", "tension", "disagreement", "ego"] },
    6: { uprightMeaning: "Transition, moving on, and leaving difficulty behind.", reversedMeaning: "Stuck in the past, unfinished business, or resistance.", keywords: ["transition", "moving on", "travel", "recovery", "passage"] },
    7: { uprightMeaning: "Deception, strategy, and acting alone.", reversedMeaning: "Confession, conscience, or plans exposed.", keywords: ["deception", "strategy", "stealth", "cunning", "secrecy"] },
    8: { uprightMeaning: "Restriction, fear, and feeling trapped.", reversedMeaning: "Release, self-limiting beliefs faced, or new perspective.", keywords: ["restriction", "fear", "imprisonment", "anxiety", "helplessness"] },
    9: { uprightMeaning: "Anxiety, nightmares, and mental anguish.", reversedMeaning: "Hope, reaching out, or fears easing.", keywords: ["anxiety", "worry", "fear", "nightmares", "despair"] },
    10: { uprightMeaning: "Painful ending, rock bottom, and release through surrender.", reversedMeaning: "Recovery, survival, and worst behind you.", keywords: ["ending", "betrayal", "loss", "rock bottom", "release"] },
  },
  pentacles: {
    2: { uprightMeaning: "Balance, adaptability, and juggling priorities.", reversedMeaning: "Overcommitment, disorganization, or financial imbalance.", keywords: ["balance", "adaptability", "priorities", "flexibility", "multitasking"] },
    3: { uprightMeaning: "Teamwork, craft, and building skills together.", reversedMeaning: "Lack of teamwork, poor workmanship, or disharmony.", keywords: ["teamwork", "craft", "collaboration", "skill", "planning"] },
    4: { uprightMeaning: "Security, saving, and holding tight to resources.", reversedMeaning: "Greed, over-control, or financial insecurity despite hoarding.", keywords: ["security", "conservation", "control", "stability", "possessiveness"] },
    5: { uprightMeaning: "Hardship, poverty mindset, and feeling excluded.", reversedMeaning: "Recovery, charity received, or spiritual over material lack.", keywords: ["hardship", "loss", "isolation", "worry", "struggle"] },
    6: { uprightMeaning: "Generosity, charity, and fair exchange.", reversedMeaning: "Strings attached, debt, or one-sided giving.", keywords: ["generosity", "charity", "sharing", "support", "fairness"] },
    7: { uprightMeaning: "Long-term vision, investment, and patience for harvest.", reversedMeaning: "Impatience, poor returns, or lack of long-term plan.", keywords: ["patience", "investment", "growth", "vision", "assessment"] },
    8: { uprightMeaning: "Apprenticeship, diligence, and mastery through repetition.", reversedMeaning: "Perfectionism, shortcuts, or lack of focus.", keywords: ["skill", "craft", "diligence", "apprenticeship", "quality"] },
    9: { uprightMeaning: "Abundance, luxury, and self-sufficiency earned.", reversedMeaning: "Overindulgence, financial dependence, or hollow success.", keywords: ["abundance", "luxury", "independence", "success", "discipline"] },
    10: { uprightMeaning: "Legacy, wealth, and family prosperity across generations.", reversedMeaning: "Financial failure, family conflict, or unstable legacy.", keywords: ["legacy", "wealth", "family", "inheritance", "long-term success"] },
  },
};

const COURT: Record<string, Record<string, CardMeaningSeed>> = {
  wands: {
    page: { uprightMeaning: "Enthusiasm, exploration, and a spark of creative discovery.", reversedMeaning: "Lack of direction, procrastination, or immature ambition.", keywords: ["exploration", "enthusiasm", "discovery", "message", "potential"] },
    knight: { uprightMeaning: "Action, adventure, and passionate pursuit of a goal.", reversedMeaning: "Impulsiveness, frustration, or reckless haste.", keywords: ["action", "passion", "adventure", "impulsiveness", "energy"] },
    queen: { uprightMeaning: "Confidence, warmth, and vibrant creative leadership.", reversedMeaning: "Demanding, jealous, or insecure leadership.", keywords: ["confidence", "warmth", "determination", "independence", "charisma"] },
    king: { uprightMeaning: "Visionary leadership, entrepreneurship, and bold authority.", reversedMeaning: "Impulsive decisions, tyranny, or unreachable standards.", keywords: ["leadership", "vision", "entrepreneurship", "honor", "authority"] },
  },
  cups: {
    page: { uprightMeaning: "Creative opportunity, intuitive message, and gentle curiosity.", reversedMeaning: "Emotional immaturity, creative block, or escapism.", keywords: ["intuition", "creativity", "sensitivity", "message", "wonder"] },
    knight: { uprightMeaning: "Romance, charm, and following the heart's quest.", reversedMeaning: "Moodiness, unrealistic ideals, or jealousy.", keywords: ["romance", "charm", "idealism", "emotion", "quest"] },
    queen: { uprightMeaning: "Compassion, calm, and deep emotional intelligence.", reversedMeaning: "Emotional dependence, martyrdom, or smothering care.", keywords: ["compassion", "calm", "intuition", "nurture", "empathy"] },
    king: { uprightMeaning: "Emotional balance, diplomacy, and wise counsel.", reversedMeaning: "Emotional manipulation, moodiness, or cold withdrawal.", keywords: ["diplomacy", "balance", "wisdom", "control", "support"] },
  },
  swords: {
    page: { uprightMeaning: "Curiosity, mental agility, and thirst for truth.", reversedMeaning: "Gossip, scattered thoughts, or all talk no action.", keywords: ["curiosity", "ideas", "vigilance", "communication", "learning"] },
    knight: { uprightMeaning: "Swift intellect, ambition, and direct pursuit of truth.", reversedMeaning: "Aggression, impatience, or ruthless argument.", keywords: ["ambition", "action", "intellect", "directness", "drive"] },
    queen: { uprightMeaning: "Clear boundaries, perceptive judgment, and honest independence.", reversedMeaning: "Coldness, bitterness, or overly harsh criticism.", keywords: ["perception", "independence", "honesty", "boundaries", "clarity"] },
    king: { uprightMeaning: "Intellectual authority, ethical leadership, and strategic truth.", reversedMeaning: "Manipulation, cruelty, or abuse of intellectual power.", keywords: ["authority", "truth", "strategy", "logic", "leadership"] },
  },
  pentacles: {
    page: { uprightMeaning: "Manifestation, study, and new financial or skill opportunity.", reversedMeaning: "Lack of progress, laziness, or missed opportunity.", keywords: ["study", "opportunity", "manifestation", "ambition", "learning"] },
    knight: { uprightMeaning: "Routine, reliability, and steady progress toward goals.", reversedMeaning: "Stagnation, boredom, or perfectionism blocking action.", keywords: ["reliability", "routine", "efficiency", "patience", "work"] },
    queen: { uprightMeaning: "Practical nurture, security, and grounded abundance.", reversedMeaning: "Work-life imbalance, smothering, or financial worry.", keywords: ["nurture", "security", "practicality", "abundance", "comfort"] },
    king: { uprightMeaning: "Wealth mastery, business acumen, and disciplined success.", reversedMeaning: "Greed, materialism, or stubborn rigidity.", keywords: ["wealth", "discipline", "success", "security", "leadership"] },
  },
};

const ACES: Record<string, CardMeaningSeed> = {
  "ace-of-wands": { uprightMeaning: "Creative spark, new passion project, and inspired potential.", reversedMeaning: "Delays, lack of motivation, or a false start.", keywords: ["inspiration", "potential", "creation", "spark", "opportunity"] },
  "ace-of-cups": { uprightMeaning: "New love, emotional awakening, and intuitive opening.", reversedMeaning: "Emotional loss, blocked feelings, or empty gestures.", keywords: ["love", "intuition", "compassion", "new feelings", "overflow"] },
  "ace-of-swords": { uprightMeaning: "Breakthrough clarity, truth, and mental victory.", reversedMeaning: "Confusion, misinformation, or harsh truth misused.", keywords: ["clarity", "truth", "breakthrough", "justice", "intellect"] },
  "ace-of-pentacles": { uprightMeaning: "New financial opportunity, manifestation, and solid beginnings.", reversedMeaning: "Missed chance, poor planning, or short-term thinking.", keywords: ["opportunity", "prosperity", "manifestation", "abundance", "grounding"] },
};

function slugFromFilename(filename: string): string {
  return filename.replace(/\.(png|jpg|jpeg|webp)$/i, "").toLowerCase();
}

function buildMinorSlug(rank: string, suit: string): string {
  return `${rank}-of-${suit}`;
}

/** Resolve meaning for a Cards-png filename; returns null if unknown slug. */
export function getRiderWaiteMeaning(filename: string): CardMeaningSeed | null {
  const slug = slugFromFilename(filename);
  if (MAJOR[slug]) return MAJOR[slug];
  if (ACES[slug]) return ACES[slug];

  const minorMatch = slug.match(
    /^(ace|two|three|four|five|six|seven|eight|nine|ten|page|knight|queen|king)-of-(wands|cups|swords|pentacles)$/,
  );
  if (!minorMatch) return null;

  const [, rank, suit] = minorMatch;
  if (rank === "ace") return ACES[slug] ?? null;

  const court = COURT[suit]?.[rank];
  if (court) return court;

  const rankToNum: Record<string, number> = {
    two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  };
  const num = rankToNum[rank];
  if (num && PIP_NUANCE[suit]?.[num]) return PIP_NUANCE[suit][num];

  const theme = SUIT_THEMES[suit];
  if (!theme) return null;
  const label = RANK_NAMES[rank] ?? rank;
  return {
    uprightMeaning: `${label} of ${suit}: ${theme.upright} Focus on ${theme.domain}.`,
    reversedMeaning: `${label} of ${suit} reversed: ${theme.reversed}`,
    keywords: [...theme.keywords],
  };
}

export const RIDER_WAITE_MAJOR_COUNT = Object.keys(MAJOR).length;
