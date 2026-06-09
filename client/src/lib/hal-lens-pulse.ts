/** Idle / “Hello friend” — slow, softer pulse. */
export const HAL_LENS_PULSE_READY = "6s";
/** Deck resequence — medium tempo (pairs with shuffle overlay). */
export const HAL_LENS_PULSE_SHUFFLE = "2s";
/** Spread + reading log / interpretation — fast, high alert. */
export const HAL_LENS_PULSE_INTERPRET = "0.8s";
/** Critical or human-error — staccato. */
export const HAL_LENS_PULSE_CRITICAL = "0.2s";

export type HalLensIntensity = "subtle" | "medium" | "high";
