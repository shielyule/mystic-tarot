# HAL voice (archived for launch)

Voice-over, browser TTS greeting, Voice lab panel, and speech-synced lens motion were removed from the active app for launch. Visual lens pulsing (CSS) remains on the home screen.

## Files

| File | Role |
|------|------|
| `hal-greeting.ts` | TTS greeting, test utterances, lens speech events |
| `hal-voice-settings.ts` | localStorage voice prefs |
| `hal-voice-panel.tsx` | Voice lab UI (fixed panel) |
| `use-hal-lens-speech-pulse.ts` | Framer Motion scale tied to speech boundaries |

## Restore checklist

1. Copy files back to their original paths under `client/src/` (lib, components, hooks).
2. In `App.tsx`: import `scheduleHalGreeting`, `getHalVoiceSettings`, `HalVoicePanel`; mount panel and auto-greeting effect.
3. In `home.tsx`: swap `useHalLensPulse` for `useHalLensSpeechPulse`.
4. Source a more HAL-like voice (see notes below).

## HAL voice sourcing (future)

Browser `speechSynthesis` voices vary by OS and rarely sound like HAL. Options for a closer match:

- **Pre-recorded clips** — ElevenLabs / Play.ht with a calm, soft male voice; ship MP3s for greeting + key lines.
- **Cloud TTS** — Google Wavenet, Amazon Polly "Matthew", or Azure neural voices; proxy via server so API keys stay secret.
- **Reference voice clone** — only if you have rights to the reference; use licensed voice libraries instead of copying film dialogue.

The Voice lab panel was useful for tuning rate/pitch/voice URI before locking a production voice.
