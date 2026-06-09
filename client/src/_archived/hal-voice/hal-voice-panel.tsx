import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  getHalVoiceSettings,
  resetHalVoiceSettings,
  setHalVoiceSettings,
  type HalVoiceSettings,
} from "./hal-voice-settings";
import {
  HAL_GREETING_LINES,
  loadVoices,
  playHalGreeting,
  playTestUtterance,
  stopHalSpeech,
} from "./hal-greeting";

const AUTO_VALUE = "__auto__";

export default function HalVoicePanel() {
  const [open, setOpen] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [settings, setSettings] = useState<HalVoiceSettings>(() => getHalVoiceSettings());
  const [testLine, setTestLine] = useState<string>(() => HAL_GREETING_LINES[0] ?? "");

  const refreshSettings = useCallback(() => {
    setSettings(getHalVoiceSettings());
  }, []);

  useEffect(() => {
    void loadVoices().then(setVoices);
    const onVoices = () => void loadVoices().then(setVoices);
    speechSynthesis.addEventListener("voiceschanged", onVoices);
    const onStorage = () => refreshSettings();
    window.addEventListener("hal-voice-settings-changed", onStorage);
    return () => {
      speechSynthesis.removeEventListener("voiceschanged", onVoices);
      window.removeEventListener("hal-voice-settings-changed", onStorage);
    };
  }, [refreshSettings]);

  const englishVoices = useMemo(() => {
    return [...voices]
      .filter((v) => v.lang.toLowerCase().startsWith("en"))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [voices]);

  const voiceSelectValue = settings.voiceURI ?? AUTO_VALUE;

  const patch = (partial: Partial<HalVoiceSettings>) => {
    setSettings(setHalVoiceSettings(partial));
  };

  return (
    <div className="fixed bottom-12 left-2 z-[60] max-w-[min(22rem,calc(100vw-1rem))] sm:left-4">
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="border-white/40 bg-black/80 font-mono-data text-[10px] uppercase tracking-widest text-on-background hover:bg-black"
          >
            {open ? (
              <ChevronDown className="mr-1 h-3 w-3" />
            ) : (
              <ChevronUp className="mr-1 h-3 w-3" />
            )}
            Voice lab
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-3 rounded-md border border-white/25 bg-black/90 p-3 text-left shadow-lg backdrop-blur-md">
          <p className="font-mono-data text-[10px] leading-relaxed text-muted-foreground">
            Browser speech is synthetic. For film-authentic HAL you would use recorded lines or a
            neural voice + your reference audio. Here you can tune rate, pitch, and voice.
          </p>

          <div className="space-y-1">
            <Label className="font-label-caps text-[10px] text-primary">Voice</Label>
            <Select
              value={voiceSelectValue}
              onValueChange={(v) =>
                patch({ voiceURI: v === AUTO_VALUE ? null : v })
              }
            >
              <SelectTrigger className="h-9 border-white/30 bg-transparent text-xs">
                <SelectValue placeholder="Auto" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value={AUTO_VALUE}>Auto (calm English)</SelectItem>
                {englishVoices.map((v) => (
                  <SelectItem key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono-data text-[10px] text-muted-foreground">
              <span>Rate (slow → fast)</span>
              <span>{settings.rate.toFixed(2)}</span>
            </div>
            <Slider
              min={0.4}
              max={1.15}
              step={0.02}
              value={[settings.rate]}
              onValueChange={([v]) => patch({ rate: v })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono-data text-[10px] text-muted-foreground">
              <span>Pitch (low → high)</span>
              <span>{settings.pitch.toFixed(2)}</span>
            </div>
            <Slider
              min={0.5}
              max={1.35}
              step={0.02}
              value={[settings.pitch]}
              onValueChange={([v]) => patch({ pitch: v })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono-data text-[10px] text-muted-foreground">
              <span>Volume</span>
              <span>{settings.volume.toFixed(2)}</span>
            </div>
            <Slider
              min={0.2}
              max={1}
              step={0.05}
              value={[settings.volume]}
              onValueChange={([v]) => patch({ volume: v })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono-data text-[10px] text-muted-foreground">
              <span>Pause between lines (ms)</span>
              <span>{settings.pauseBetweenMs}</span>
            </div>
            <Slider
              min={300}
              max={3500}
              step={50}
              value={[settings.pauseBetweenMs]}
              onValueChange={([v]) => patch({ pauseBetweenMs: v })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between font-mono-data text-[10px] text-muted-foreground">
              <span>Greeting delay (ms)</span>
              <span>{settings.greetingDelayMs}</span>
            </div>
            <Slider
              min={0}
              max={15000}
              step={250}
              value={[settings.greetingDelayMs]}
              onValueChange={([v]) => patch({ greetingDelayMs: v })}
            />
          </div>

          <label className="flex cursor-pointer items-center gap-2 font-mono-data text-[10px] text-on-background">
            <input
              type="checkbox"
              className="accent-primary"
              checked={settings.autoSpeakGreeting}
              onChange={(e) => patch({ autoSpeakGreeting: e.target.checked })}
            />
            Auto-play greeting after delay (reload after changing delay or turning this on)
          </label>

          <div className="space-y-1">
            <Label className="font-label-caps text-[10px] text-primary">Test line</Label>
            <Textarea
              rows={2}
              value={testLine}
              onChange={(e) => setTestLine(e.target.value)}
              className="resize-none border-white/30 bg-transparent text-xs text-on-background"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="font-mono-data text-[10px] uppercase"
              onClick={() => void playTestUtterance(testLine)}
            >
              Speak test
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="font-mono-data text-[10px] uppercase"
              onClick={() => void playHalGreeting()}
            >
              Full greeting
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="font-mono-data text-[10px] uppercase"
              onClick={() => stopHalSpeech()}
            >
              Stop
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="font-mono-data text-[10px] uppercase text-muted-foreground"
              onClick={() => setSettings(resetHalVoiceSettings())}
            >
              Reset defaults
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
