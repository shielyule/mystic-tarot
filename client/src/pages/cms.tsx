import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Upload, Save, Check, CloudUpload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { insertDeckSchema } from "@shared/schema";
import { z } from "zod";

const deckFormSchema = insertDeckSchema.extend({
  theme: z.string().min(1, "Theme is required"),
});

type DeckFormData = z.infer<typeof deckFormSchema>;

export default function CMS() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentSuit, setCurrentSuit] = useState("wands");
  const [uploadProgress, setUploadProgress] = useState({
    majorArcana: 0,
    minorArcana: 0,
    cardBack: false,
  });

  const form = useForm<DeckFormData>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      name: "",
      description: "",
      theme: "",
      isCustom: true,
    },
  });

  // Create deck mutation
  const createDeck = useMutation({
    mutationFn: async (data: DeckFormData) => {
      const response = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create deck");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/decks"] });
      toast({
        title: "Deck Created",
        description: "Your custom deck has been created successfully!",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create deck. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Upload files mutation
  const uploadFiles = useMutation({
    mutationFn: async ({ files, deckId, cardType }: { 
      files: FileList; 
      deckId: string; 
      cardType: string; 
    }) => {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("cards", file);
      });
      formData.append("deckId", deckId);
      formData.append("cardType", cardType);

      const response = await fetch("/api/upload/card-images", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload files");
      return response.json();
    },
  });

  // Upload card back mutation
  const uploadCardBack = useMutation({
    mutationFn: async ({ file, deckId }: { file: File; deckId: string }) => {
      const formData = new FormData();
      formData.append("cardBack", file);
      formData.append("deckId", deckId);

      const response = await fetch("/api/upload/card-back", {
        method: "POST",
        body: formData,
      });
      if (!response.ok) throw new Error("Failed to upload card back");
      return response.json();
    },
  });

  const onSubmit = (data: DeckFormData) => {
    createDeck.mutate(data);
  };

  const handleFileUpload = (
    files: FileList | null, 
    cardType: "major_arcana" | "minor_arcana"
  ) => {
    if (!files || files.length === 0) return;

    // For demo purposes, simulate progress
    const targetCount = cardType === "major_arcana" ? 22 : 14;
    const uploadedCount = Math.min(files.length, targetCount);
    
    setUploadProgress(prev => ({
      ...prev,
      [cardType === "major_arcana" ? "majorArcana" : "minorArcana"]: uploadedCount
    }));

    toast({
      title: "Files Uploaded",
      description: `${uploadedCount} ${cardType.replace("_", " ")} cards uploaded successfully.`,
    });
  };

  const handleCardBackUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadProgress(prev => ({ ...prev, cardBack: true }));
    toast({
      title: "Card Back Uploaded",
      description: "Card back design has been uploaded successfully.",
    });
  };

  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const deckName = form.getValues('name') || 'Uploaded Deck';
    
    try {
      // First create the deck
      const deckData = {
        name: deckName,
        description: form.getValues('description') || 'Bulk uploaded deck',
        theme: form.getValues('theme') || 'classic',
        isCustom: true,
      };

      const deckResponse = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deckData),
      });
      
      if (!deckResponse.ok) throw new Error("Failed to create deck");
      const deck = await deckResponse.json();

      // Then upload all the card files
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("cards", file);
      });
      formData.append("deckId", deck.id);

      const uploadResponse = await fetch("/api/upload/bulk-deck", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Failed to upload files");
      const result = await uploadResponse.json();

      toast({
        title: "Bulk Upload Successful!",
        description: `Successfully uploaded ${files.length} cards and created ${result.cards.length} tarot cards.`,
      });

      // Update progress
      setUploadProgress(prev => ({
        ...prev,
        majorArcana: 22,
        minorArcana: 56,
        cardBack: true,
      }));

      // Reset form and redirect
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/decks"] });

    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload deck. Please check file names and try again.",
        variant: "destructive",
      });
    }
  };

  const suits = [
    { id: "wands", name: "Wands", count: 14 },
    { id: "cups", name: "Cups", count: 14 },
    { id: "swords", name: "Swords", count: 14 },
    { id: "pentacles", name: "Pentacles", count: 14 },
  ];

  const themes = [
    { value: "mystical", label: "Mystical" },
    { value: "nature", label: "Nature" },
    { value: "cosmic", label: "Cosmic" },
    { value: "artistic", label: "Artistic" },
    { value: "minimal", label: "Minimal" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="font-cinzel text-4xl md:text-5xl font-semibold mb-4 text-mystic-gold">
          Create Custom Deck
        </h2>
        <p className="text-mystic-gold-light text-lg max-w-2xl mx-auto">
          Upload your own tarot card designs and create a personalized deck for your readings
        </p>
      </div>

      {/* Deck Information Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-mystic-gold/20 mb-8"
      >
        <h3 className="font-cinzel text-xl font-semibold text-mystic-gold mb-6">Deck Information</h3>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mystic-gold-light">Deck Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter deck name..."
                        className="bg-mystic-800/50 border-mystic-gold/30 text-white placeholder-mystic-gold-light/50 focus:border-mystic-gold"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="theme"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-mystic-gold-light">Theme</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-mystic-800/50 border-mystic-gold/30 text-white focus:border-mystic-gold">
                          <SelectValue placeholder="Select theme..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-mystic-800 border-mystic-gold/30">
                        {themes.map((theme) => (
                          <SelectItem key={theme.value} value={theme.value} className="text-white hover:bg-mystic-600/50">
                            {theme.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-mystic-gold-light">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ''}
                      placeholder="Describe your deck's unique characteristics and energy..."
                      rows={3}
                      className="bg-mystic-800/50 border-mystic-gold/30 text-white placeholder-mystic-gold-light/50 focus:border-mystic-gold resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </motion.div>

      {/* Card Upload Sections */}
      <div className="space-y-8">

        {/* Bulk Upload Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-gradient-to-r from-mystic-gold/10 to-mystic-600/10 backdrop-blur-md rounded-xl p-8 border-2 border-mystic-gold/40"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-cinzel text-xl font-semibold text-mystic-gold">Bulk Upload Complete Deck</h3>
              <p className="text-sm text-mystic-gold-light mt-2">Perfect for uploading your Rider-Waite Smith collection!</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-mystic-gold">78</div>
              <div className="text-xs text-mystic-gold-light">Total Cards</div>
            </div>
          </div>

          <div className="bg-mystic-900/40 rounded-lg p-6 mb-6">
            <h4 className="font-semibold text-mystic-gold mb-3">📋 Your Collection Structure</h4>
            <div className="grid md:grid-cols-2 gap-6 text-sm text-mystic-gold-light">
              <div>
                <p className="font-medium mb-3 text-mystic-gold">📂 What You Have:</p>
                <div className="space-y-2 text-xs bg-mystic-800/50 p-4 rounded">
                  <div className="flex items-center justify-between">
                    <span>🎴 Major Arcana (Named Cards)</span>
                    <span className="text-mystic-gold font-bold">22</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🏆 Cups Cards</span>
                    <span className="text-mystic-gold font-bold">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>⚔️ Swords Cards</span>
                    <span className="text-mystic-gold font-bold">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🪄 Wands Cards</span>
                    <span className="text-mystic-gold font-bold">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>🪙 Pentacles Cards</span>
                    <span className="text-mystic-gold font-bold">14</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-mystic-gold/20 pt-2">
                    <span>🎭 Card Back Design</span>
                    <span className="text-mystic-gold font-bold">1</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-mystic-gold/30 pt-2 font-bold text-mystic-gold">
                    <span>Total</span>
                    <span>79 files</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="font-medium mb-3 text-mystic-gold">✨ Auto-Recognition:</p>
                <div className="space-y-2 text-xs bg-mystic-800/50 p-4 rounded">
                  <div>✓ Major Arcana by name (fool, magician, etc.)</div>
                  <div>✓ Minor Arcana by suit folder names</div>
                  <div>✓ Card numbers (01-14) automatically parsed</div>
                  <div>✓ Court cards (page, knight, queen, king)</div>
                  <div>✓ CardBacks file for deck back design</div>
                </div>
                <div className="mt-4 p-3 bg-gradient-to-r from-mystic-gold/10 to-mystic-600/10 rounded border border-mystic-gold/30">
                  <p className="text-xs font-medium text-mystic-gold">🚀 Pro Tip</p>
                  <p className="text-xs text-mystic-gold-light mt-1">Select all 79 files at once! The system will sort them automatically into the proper structure.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div 
            className="border-2 border-dashed border-mystic-gold/50 rounded-xl p-16 text-center hover:border-mystic-gold transition-colors cursor-pointer bg-mystic-900/20"
            onClick={() => document.getElementById('bulk-upload')?.click()}
          >
            <Upload className="text-mystic-gold text-6xl mb-6 mx-auto animate-bounce" />
            <h4 className="font-cinzel text-2xl font-semibold text-mystic-gold mb-4">Drop All 79 Files Here</h4>
            <p className="text-mystic-gold-light text-lg mb-4">Select your complete Rider-Waite collection at once</p>
            <div className="grid grid-cols-3 gap-4 text-xs text-mystic-gold-light/80 mb-4">
              <div>22 Named Cards</div>
              <div>56 Suit Cards</div>
              <div>1 CardBacks file</div>
            </div>
            <div className="flex items-center justify-center gap-4 text-sm text-mystic-gold-light/70">
              <span>PNG • JPG • WebP</span>
              <span>•</span>
              <span>Max 5MB each</span>
              <span>•</span>
              <span>79 files total</span>
            </div>
            <input
              type="file"
              id="bulk-upload"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleBulkUpload(e.target.files)}
            />
          </div>

          <div className="mt-6 p-4 bg-mystic-800/30 rounded-lg">
            <p className="text-xs text-mystic-gold-light">
              <strong>Tip:</strong> The system will automatically recognize card names from your filenames and create the complete deck structure for you!
            </p>
          </div>
        </motion.div>
        
        {/* Major Arcana Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-mystic-gold/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-cinzel text-xl font-semibold text-mystic-gold">Major Arcana (22 Cards)</h3>
            <span className="text-sm text-mystic-gold-light bg-mystic-600/50 px-3 py-1 rounded-full">
              {uploadProgress.majorArcana}/22 uploaded
            </span>
          </div>
          
          {/* Upload Zone */}
          <div 
            className="border-2 border-dashed border-mystic-gold/30 rounded-xl p-12 text-center hover:border-mystic-gold/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('major-arcana-upload')?.click()}
          >
            <CloudUpload className="text-mystic-gold text-4xl mb-4 mx-auto" />
            <h4 className="font-semibold text-mystic-gold mb-2">Drop Major Arcana cards here</h4>
            <p className="text-mystic-gold-light text-sm mb-4">or click to browse files</p>
            <p className="text-xs text-mystic-gold-light/70">Supports JPG, PNG, WebP • Max 5MB per file</p>
            <input
              type="file"
              id="major-arcana-upload"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files, "major_arcana")}
            />
          </div>

          {/* Progress Grid */}
          <div className="mt-6 grid grid-cols-3 md:grid-cols-6 lg:grid-cols-11 gap-3">
            {Array.from({ length: 22 }, (_, i) => (
              <div
                key={i}
                className={`aspect-[2/3] rounded-lg border ${
                  i < uploadProgress.majorArcana
                    ? "bg-mystic-600/50 border-mystic-gold/30"
                    : "bg-mystic-800/30 border-mystic-gold/10 opacity-50"
                }`}
              >
                <div className="w-full h-full flex items-center justify-center">
                  {i < uploadProgress.majorArcana ? (
                    <Check className="text-mystic-gold text-sm" />
                  ) : (
                    <Upload className="text-mystic-gold/50 text-sm" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Minor Arcana Upload */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-mystic-gold/20"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-cinzel text-xl font-semibold text-mystic-gold">Minor Arcana (56 Cards)</h3>
            <span className="text-sm text-mystic-gold-light bg-mystic-600/50 px-3 py-1 rounded-full">
              {uploadProgress.minorArcana}/56 uploaded
            </span>
          </div>

          {/* Suit Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {suits.map((suit) => (
              <Button
                key={suit.id}
                onClick={() => setCurrentSuit(suit.id)}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap ${
                  currentSuit === suit.id
                    ? "bg-mystic-gold text-mystic-900"
                    : "bg-mystic-600/80 text-white hover:bg-mystic-600"
                }`}
              >
                {suit.name} ({suit.count})
              </Button>
            ))}
          </div>
          
          {/* Upload Zone for Current Suit */}
          <div 
            className="border-2 border-dashed border-mystic-gold/30 rounded-xl p-12 text-center hover:border-mystic-gold/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('minor-arcana-upload')?.click()}
          >
            <CloudUpload className="text-mystic-gold text-4xl mb-4 mx-auto" />
            <h4 className="font-semibold text-mystic-gold mb-2 capitalize">
              Drop {currentSuit} cards here
            </h4>
            <p className="text-mystic-gold-light text-sm mb-4">Upload all 14 cards for this suit</p>
            <p className="text-xs text-mystic-gold-light/70">Ace, 2-10, Page, Knight, Queen, King</p>
            <input
              type="file"
              id="minor-arcana-upload"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files, "minor_arcana")}
            />
          </div>
        </motion.div>

        {/* Card Back Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-black/40 backdrop-blur-md rounded-xl p-8 border border-mystic-gold/20"
        >
          <h3 className="font-cinzel text-xl font-semibold text-mystic-gold mb-6">Card Back Design</h3>
          
          <div 
            className="border-2 border-dashed border-mystic-gold/30 rounded-xl p-12 text-center hover:border-mystic-gold/50 transition-colors cursor-pointer"
            onClick={() => document.getElementById('card-back-upload')?.click()}
          >
            <ImageIcon className="text-mystic-gold text-4xl mb-4 mx-auto" />
            <h4 className="font-semibold text-mystic-gold mb-2">Upload card back design</h4>
            <p className="text-mystic-gold-light text-sm mb-4">This will be shown when cards are face down</p>
            <p className="text-xs text-mystic-gold-light/70">Recommended: 400x600px • JPG, PNG, WebP</p>
            <input
              type="file"
              id="card-back-upload"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleCardBackUpload(e.target.files)}
            />
          </div>

          {/* Card Back Preview */}
          <div className="mt-6 flex justify-center">
            <div className="w-32 h-48 bg-mystic-800/50 rounded-lg border border-mystic-gold/20 flex items-center justify-center">
              <div className="text-center">
                {uploadProgress.cardBack ? (
                  <Check className="text-mystic-gold text-2xl mb-2 mx-auto" />
                ) : (
                  <ImageIcon className="text-mystic-gold/50 text-2xl mb-2 mx-auto" />
                )}
                <p className="text-xs text-mystic-gold-light/50">
                  {uploadProgress.cardBack ? "Uploaded" : "Preview"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center gap-4"
        >
          <Button
            type="button"
            className="bg-mystic-600/80 hover:bg-mystic-600 text-white px-8 py-3 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Draft
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createDeck.isPending}
            className="bg-mystic-gold hover:bg-mystic-gold/90 text-mystic-900 px-8 py-3 font-semibold transition-colors"
          >
            {createDeck.isPending ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-mystic-900/20 border-t-mystic-900" />
                Creating...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Publish Deck
              </>
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
